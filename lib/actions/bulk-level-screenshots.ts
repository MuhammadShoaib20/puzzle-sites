'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';
import { requireAuth } from '@/lib/require-auth';
import { supabaseAdmin } from '@/lib/supabase';

const MAX_CSV_SIZE = 4_900_000;
const MAX_IMAGE_SIZE = 5_000_000;
const MAX_TOTAL_SIZE = 49_000_000;
const HEADERS = [
  'game_slug',
  'level_number',
  'title',
  'description',
  'walkthrough',
  'tips',
  'meta_title',
  'meta_description',
  'image_1_name',
  'image_1_overview',
  'image_2_name',
  'image_2_overview',
  'image_3_name',
  'image_3_overview',
] as const;
const TEXT_FIELDS = [
  'title',
  'description',
  'walkthrough',
  'tips',
  'meta_title',
  'meta_description',
] as const;
const IMAGE_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

type CsvRow = Record<(typeof HEADERS)[number], string>;

type SkippedItem = {
  rowNumber: number;
  message: string;
};

export type BulkLevelScreenshotsResult = {
  success: boolean;
  updatedCount?: number;
  skippedItems?: SkippedItem[];
  error?: string;
};

function levelKey(gameId: string, levelNumber: number) {
  return `${gameId}:${levelNumber}`;
}

export async function bulkUpdateLevelFullData(
  formData: FormData
): Promise<BulkLevelScreenshotsResult> {
  try {
    await requireAuth();

    const csvEntry = formData.get('csv');
    if (!(csvEntry instanceof File) || csvEntry.size === 0 || !/\.csv$/i.test(csvEntry.name)) {
      return { success: false, error: 'Please select a non-empty CSV file.' };
    }
    if (csvEntry.size > MAX_CSV_SIZE) {
      return { success: false, error: 'The CSV file must be smaller than 4.9 MB.' };
    }

    const imageEntries = formData.getAll('images');
    if (imageEntries.some((entry) => typeof entry !== 'string' && !(entry instanceof File))) {
      return { success: false, error: 'Please select valid image files.' };
    }
    const files = imageEntries.filter(
      (entry): entry is File => entry instanceof File && entry.size > 0
    );
    if (files.reduce((total, file) => total + file.size, csvEntry.size) > MAX_TOTAL_SIZE) {
      return { success: false, error: 'The total upload size must be smaller than 49 MB.' };
    }

    const parsed = Papa.parse<CsvRow>(await csvEntry.text(), {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
    });
    if (parsed.errors.length > 0) {
      const firstError = parsed.errors[0];
      return {
        success: false,
        error: `Invalid CSV near row ${(firstError.row ?? 0) + 2}: ${firstError.message}`,
      };
    }

    const headers = parsed.meta.fields || [];
    const missingHeaders = HEADERS.filter((header) => !headers.includes(header));
    const unexpectedHeaders = headers.filter(
      (header) => !(HEADERS as readonly string[]).includes(header)
    );
    if (
      headers.length !== HEADERS.length ||
      missingHeaders.length > 0 ||
      unexpectedHeaders.length > 0 ||
      Object.keys(parsed.meta.renamedHeaders || {}).length > 0
    ) {
      return {
        success: false,
        error: `The CSV must contain exactly these columns: ${HEADERS.join(', ')}.`,
      };
    }
    if (parsed.data.length === 0) {
      return { success: false, error: 'The CSV does not contain any level rows.' };
    }

    const skippedItems: SkippedItem[] = [];
    const imageFiles = new Map<string, File>();
    for (const file of files) {
      const extension = file.name.match(/\.[^.]+$/)?.[0].toLowerCase();
      const expectedType = extension ? IMAGE_TYPES[extension] : undefined;
      if (!expectedType || (file.type && file.type !== expectedType)) {
        skippedItems.push({
          rowNumber: 0,
          message: `${file.name}: unsupported format. Use JPG, PNG, or WebP.`,
        });
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        skippedItems.push({
          rowNumber: 0,
          message: `${file.name}: image exceeds the 5 MB limit.`,
        });
        continue;
      }
      if (imageFiles.has(file.name)) {
        skippedItems.push({
          rowNumber: 0,
          message: `${file.name}: duplicate filename; only one file per filename is allowed.`,
        });
        continue;
      }
      imageFiles.set(file.name, file);
    }

    const rows = parsed.data.map((row, index) => ({
      rowNumber: index + 2,
      gameSlug: (row.game_slug || '').trim(),
      levelNumber: Number((row.level_number || '').trim()),
      images: [1, 2, 3].map((step) => ({
        name: row[`image_${step}_name` as keyof CsvRow]?.trim() || '',
        overview: row[`image_${step}_overview` as keyof CsvRow]?.trim() || '',
      })),
      textFields: {
        title: (row.title || '').trim(),
        description: (row.description || '').trim(),
        walkthrough: (row.walkthrough || '').trim(),
        tips: (row.tips || '').trim(),
        meta_title: (row.meta_title || '').trim(),
        meta_description: (row.meta_description || '').trim(),
      },
    }));

    const gameSlugs = [...new Set(rows.map(({ gameSlug }) => gameSlug).filter(Boolean))];
    const gamesBySlug = new Map<string, string>();
    for (let offset = 0; offset < gameSlugs.length; offset += 100) {
      const { data: games, error } = await supabaseAdmin
        .from('games')
        .select('id, slug')
        .in('slug', gameSlugs.slice(offset, offset + 100));
      if (error) {
        console.error('Bulk level screenshot game lookup failed:', error);
        return { success: false, error: 'Could not look up games for the CSV rows.' };
      }
      for (const game of games || []) gamesBySlug.set(game.slug, game.id);
    }

    const validRows = rows.filter(({ gameSlug, levelNumber, rowNumber }) => {
      if (!gameSlug || !Number.isSafeInteger(levelNumber) || levelNumber < 1) {
        skippedItems.push({
          rowNumber,
          message: 'A valid game_slug and positive integer level_number are required.',
        });
        return false;
      }
      if (!gamesBySlug.has(gameSlug)) {
        skippedItems.push({ rowNumber, message: `Game "${gameSlug}" was not found.` });
        return false;
      }
      return true;
    });

    const levelNumbersByGameId = new Map<string, Set<number>>();
    for (const row of validRows) {
      const gameId = gamesBySlug.get(row.gameSlug);
      if (!gameId) continue;
      const numbers = levelNumbersByGameId.get(gameId) || new Set<number>();
      numbers.add(row.levelNumber);
      levelNumbersByGameId.set(gameId, numbers);
    }

    const levelIds = new Map<string, string>();
    for (const [gameId, numbers] of levelNumbersByGameId) {
      const levelNumbers = [...numbers];
      for (let offset = 0; offset < levelNumbers.length; offset += 100) {
        const { data: levels, error } = await supabaseAdmin
          .from('levels')
          .select('id, game_id, level_number')
          .eq('game_id', gameId)
          .in('level_number', levelNumbers.slice(offset, offset + 100));
        if (error) {
          console.error('Bulk level screenshot level lookup failed:', error);
          return { success: false, error: 'Could not look up levels for the CSV rows.' };
        }
        for (const level of levels || []) {
          levelIds.set(levelKey(level.game_id, level.level_number), level.id);
        }
      }
    }

    const seenLevels = new Set<string>();
    let updatedCount = 0;
    for (const row of validRows) {
      const gameId = gamesBySlug.get(row.gameSlug);
      if (!gameId) continue;

      const key = levelKey(gameId, row.levelNumber);
      if (seenLevels.has(key)) {
        skippedItems.push({
          rowNumber: row.rowNumber,
          message: `Duplicate row for "${row.gameSlug}" level ${row.levelNumber}.`,
        });
        continue;
      }
      seenLevels.add(key);

      const levelId = levelIds.get(key);
      if (!levelId) {
        skippedItems.push({
          rowNumber: row.rowNumber,
          message: `Level ${row.levelNumber} was not found in game "${row.gameSlug}".`,
        });
        continue;
      }

      const updateData: {
        title?: string;
        description?: string;
        walkthrough?: string;
        tips?: string;
        meta_title?: string;
        meta_description?: string;
        screenshots?: { url: string; overview: string }[];
      } = {};
      for (const field of TEXT_FIELDS) {
        const value = row.textFields[field];
        if (value) {
          updateData[field] = value;
        }
      }

      const screenshots: { url: string; overview: string }[] = [];
      const uploadedPaths: string[] = [];
      for (const image of row.images) {
        if (!image.name) continue;
        const file = imageFiles.get(image.name);
        if (!file) {
          skippedItems.push({
            rowNumber: row.rowNumber,
            message: `Image "${image.name}" was not selected and was skipped.`,
          });
          continue;
        }

        const extension = file.name.match(/\.[^.]+$/)?.[0].toLowerCase();
        if (!extension) continue;
        const storagePath =
          `levels/${row.gameSlug}/level-${row.levelNumber}/${randomUUID()}${extension}`;
        const { data, error: uploadError } = await supabaseAdmin.storage
          .from('images')
          .upload(storagePath, file, {
            cacheControl: '31536000',
            contentType: IMAGE_TYPES[extension],
            upsert: false,
          });
        if (uploadError) {
          console.error(`Bulk level screenshot upload failed for "${file.name}":`, uploadError);
          skippedItems.push({
            rowNumber: row.rowNumber,
            message: `Image "${image.name}" could not be uploaded.`,
          });
          continue;
        }

        uploadedPaths.push(data.path);
        const { data: publicUrl } = supabaseAdmin.storage.from('images').getPublicUrl(data.path);
        screenshots.push({ url: publicUrl.publicUrl, overview: image.overview });
      }

      if (screenshots.length > 0) {
        updateData.screenshots = screenshots;
      }
      if (Object.keys(updateData).length === 0) {
        skippedItems.push({
          rowNumber: row.rowNumber,
          message: 'No text values or successfully uploaded images to update.',
        });
        continue;
      }

      const { error: updateError } = await supabaseAdmin
        .from('levels')
        .update(updateData)
        .eq('id', levelId);
      if (updateError) {
        console.error(
          `Bulk level screenshot update failed for "${row.gameSlug}" level ${row.levelNumber}:`,
          updateError
        );
        const { error: cleanupError } = await supabaseAdmin.storage
          .from('images')
          .remove(uploadedPaths);
        if (cleanupError) {
          console.error('Bulk level screenshot cleanup failed:', cleanupError);
        }
        skippedItems.push({
          rowNumber: row.rowNumber,
          message: 'Images uploaded, but the level screenshots could not be updated.',
        });
        continue;
      }

      updatedCount += 1;
    }

    if (updatedCount > 0) {
      revalidatePath('/game/[slug]/[levelSlug]', 'page');
    }
    return { success: true, updatedCount, skippedItems };
  } catch (error) {
    console.error('Full bulk level update error:', error);
    if (error instanceof Error && error.message.startsWith('Unauthorized:')) {
      return { success: false, error: 'You must be signed in as an admin to update screenshots.' };
    }
    return { success: false, error: 'An unexpected error occurred while updating screenshots.' };
  }
}
