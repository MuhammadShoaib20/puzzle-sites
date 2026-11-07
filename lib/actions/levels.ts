'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { extractYoutubeId } from '@/lib/utils';
import { requireAuth } from '@/lib/require-auth';
import { getAdminUrl } from '@/lib/admin-path';

async function getGameSlug(gameId: string): Promise<{ slug: string } | { error: string }> {
  const { data: game, error } = await supabaseAdmin
    .from('games')
    .select('slug')
    .eq('id', gameId)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!game) return { error: 'Game not found.' };
  return { slug: game.slug };
}

function getLevelNumbers(levels: unknown[]): number[] {
  return [
    ...new Set(
      levels.flatMap((item) => {
        if (
          item &&
          typeof item === 'object' &&
          'level_number' in item &&
          typeof item.level_number === 'number' &&
          Number.isInteger(item.level_number)
        ) {
          return [item.level_number];
        }
        return [];
      })
    ),
  ];
}

function revalidatePublicLevelPaths(gameSlug: string, levelNumbers: number[]) {
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  revalidatePath(`/game/${gameSlug}`);
  for (const levelNumber of new Set(levelNumbers)) {
    revalidatePath(`/game/${gameSlug}/level-${levelNumber}`);
  }
}

// ==========================================
// BULK EDIT ALL LEVELS AT ONCE
// ==========================================
export async function bulkEditLevels(gameId: string, formData: FormData) {
  await requireAuth();

  const levelsJson = formData.get('levels_json') as string;
  if (!levelsJson) {
    return { error: 'No levels data provided.' };
  }

  try {
    const levels = JSON.parse(levelsJson);
    if (!Array.isArray(levels) || levels.length === 0) {
      return { error: 'Invalid levels data.' };
    }

    const game = await getGameSlug(gameId);
    if ('error' in game) return { error: game.error };

    // Upsert all levels (insert or update based on game_id, level_number)
    const { error } = await supabaseAdmin
      .from('levels')
      .upsert(levels, { onConflict: 'game_id,level_number' });

    if (error) {
      return { error: error.message };
    }

    // Update game's total_levels count
    await updateGameLevelCount(gameId);

    revalidatePath(`/ms-control-9x7k2p/games/${gameId}/levels`);
    revalidatePublicLevelPaths(game.slug, getLevelNumbers(levels));
    redirect(`/ms-control-9x7k2p/games/${gameId}/levels`);
  } catch {
    return { error: 'Failed to parse levels data.' };
  }
}

// ==========================================
// BULK GENERATE — Level 1 se N tak
// ==========================================
export async function bulkGenerateLevels(gameId: string, formData: FormData) {
  await requireAuth();

  const from = parseInt(formData.get('from') as string, 10);
  const to = parseInt(formData.get('to') as string, 10);
  const defaultYoutubeUrl = (formData.get('default_youtube_url') as string) || '';

  if (isNaN(from) || isNaN(to) || from < 1 || to < from || to > 1000) {
    return { error: 'Invalid range. From must be >= 1, To >= From, max 1000.' };
  }

  const game = await getGameSlug(gameId);
  if ('error' in game) return { error: game.error };

  // Existing levels ki list nikalo
  const { data: existing } = await supabaseAdmin
    .from('levels')
    .select('level_number')
    .eq('game_id', gameId);

  const existingNumbers = new Set((existing || []).map((l) => l.level_number));

  // Naye levels banao
  const newLevels = [];
  const defaultYoutubeId = defaultYoutubeUrl ? extractYoutubeId(defaultYoutubeUrl) : '';

  for (let n = from; n <= to; n++) {
    if (existingNumbers.has(n)) continue;
    newLevels.push({
      game_id: gameId,
      level_number: n,
      title: `Level ${n}`,
      youtube_url: defaultYoutubeUrl,
      youtube_id: defaultYoutubeId,
      published: true,
    });
  }

  if (newLevels.length === 0) {
    return { error: 'Saare levels already exist karte hain is range me.' };
  }

  const { error } = await supabaseAdmin.from('levels').insert(newLevels);

  if (error) {
    return { error: error.message };
  }

  // Game ka total_levels update karo
  const { count } = await supabaseAdmin
    .from('levels')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', gameId);

  await supabaseAdmin
    .from('games')
    .update({ total_levels: count || 0 })
    .eq('id', gameId);

  revalidatePath(`/ms-control-9x7k2p/games/${gameId}/levels`);
  revalidatePath('/ms-control-9x7k2p/games');
  revalidatePublicLevelPaths(
    game.slug,
    newLevels.map((level) => level.level_number)
  );
  redirect(`/ms-control-9x7k2p/games/${gameId}/levels`);
}

// ==========================================
// CREATE SINGLE LEVEL
// ==========================================
export async function createLevel(gameId: string, formData: FormData) {
  await requireAuth();

  const level_number = parseInt(formData.get('level_number') as string, 10);
  const title = (formData.get('title') as string) || `Level ${level_number}`;
  const youtube_url = formData.get('youtube_url') as string;
  const description = (formData.get('description') as string) || null;
  const walkthrough = (formData.get('walkthrough') as string) || null;
  const tips = (formData.get('tips') as string) || null;
  const meta_title = (formData.get('meta_title') as string) || null;
  const meta_description = (formData.get('meta_description') as string) || null;
  const published = formData.get('published') === 'on';

  if (!level_number || !youtube_url) {
    return { error: 'Level number and YouTube URL are required.' };
  }

  const youtube_id = extractYoutubeId(youtube_url);
  if (!youtube_id) {
    return { error: 'Invalid YouTube URL.' };
  }

  const game = await getGameSlug(gameId);
  if ('error' in game) return { error: game.error };

  const { error } = await supabaseAdmin.from('levels').insert({
    game_id: gameId,
    level_number,
    title,
    youtube_url,
    youtube_id,
    description,
    walkthrough,
    tips,
    meta_title,
    meta_description,
    published,
  });

  if (error) {
    if (error.message.includes('duplicate')) {
      return { error: `Level ${level_number} already exists.` };
    }
    return { error: error.message };
  }

  await updateGameLevelCount(gameId);

  revalidatePath(`/ms-control-9x7k2p/games/${gameId}/levels`);
  revalidatePublicLevelPaths(game.slug, [level_number]);
  redirect(`/ms-control-9x7k2p/games/${gameId}/levels`);
}

// ==========================================
// UPDATE LEVEL
// ==========================================
export async function updateLevel(levelId: string, gameId: string, formData: FormData) {
  await requireAuth();

  const title = formData.get('title') as string;
  const youtube_url = formData.get('youtube_url') as string;
  const description = (formData.get('description') as string) || null;
  const walkthrough = (formData.get('walkthrough') as string) || null;
  const tips = (formData.get('tips') as string) || null;
  const meta_title = (formData.get('meta_title') as string) || null;
  const meta_description = (formData.get('meta_description') as string) || null;
  const published = formData.get('published') === 'on';

  const youtube_id = extractYoutubeId(youtube_url);
  if (!youtube_id) {
    return { error: 'Invalid YouTube URL.' };
  }

  const game = await getGameSlug(gameId);
  if ('error' in game) return { error: game.error };

  const { data: existingLevel, error: lookupError } = await supabaseAdmin
    .from('levels')
    .select('level_number')
    .eq('id', levelId)
    .maybeSingle();
  if (lookupError) return { error: lookupError.message };
  if (!existingLevel) return { error: 'Level not found.' };

  const { error } = await supabaseAdmin
    .from('levels')
    .update({
      title,
      youtube_url,
      youtube_id,
      description,
      walkthrough,
      tips,
      meta_title,
      meta_description,
      published,
    })
    .eq('id', levelId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/ms-control-9x7k2p/games/${gameId}/levels`);
  revalidatePath(`/ms-control-9x7k2p/games/${gameId}/levels/${levelId}/edit`);
  revalidatePublicLevelPaths(game.slug, [existingLevel.level_number]);
  redirect(getAdminUrl(`/games/${gameId}/levels/${levelId}/edit`));
}

// ==========================================
// DELETE LEVEL
// ==========================================
export async function deleteLevel(levelId: string, gameId: string) {
  await requireAuth();

  const game = await getGameSlug(gameId);
  if ('error' in game) return { error: game.error };

  const { data: existingLevel, error: lookupError } = await supabaseAdmin
    .from('levels')
    .select('level_number')
    .eq('id', levelId)
    .maybeSingle();
  if (lookupError) return { error: lookupError.message };
  if (!existingLevel) return { error: 'Level not found.' };

  const { error } = await supabaseAdmin.from('levels').delete().eq('id', levelId);

  if (error) {
    return { error: error.message };
  }

  await updateGameLevelCount(gameId);

  revalidatePath(`/ms-control-9x7k2p/games/${gameId}/levels`);
  revalidatePath('/ms-control-9x7k2p/games');
  revalidatePublicLevelPaths(game.slug, [existingLevel.level_number]);
}

// ==========================================
// BULK IMPORT FROM CSV
// ==========================================
export async function bulkImportLevels(
  gameId: string,
  levelsJson: string,
): Promise<
  | { error: string }
  | { success: true; inserted: number; skipped: number; invalid: number }
> {
  await requireAuth();

  const levels = JSON.parse(levelsJson);
  if (!Array.isArray(levels) || levels.length === 0) {
    return { error: 'No valid levels data provided.' };
  }

  // Get existing levels to avoid duplicates
  const { data: existing } = await supabaseAdmin
    .from('levels')
    .select('level_number')
    .eq('game_id', gameId);

  const existingNumbers = new Set((existing || []).map((l) => l.level_number));

  const newLevels: {
    game_id: string;
    level_number: number;
    title: string;
    youtube_url: string;
    youtube_id: string;
    walkthrough: string | null;
    tips: string | null;
    description: string | null;
    published: boolean;
  }[] = [];

  let skipped = 0;
  let invalid = 0;

  for (const level of levels) {
    const levelNumber = level.level_number;
    const youtubeUrl = level.youtube_url;
    const title = level.title || `Level ${levelNumber}`;
    const walkthrough = level.walkthrough || null;
    const tips = level.tips || null;
    const description = level.description || null;

    if (!levelNumber || levelNumber < 1 || levelNumber > 100000) {
      invalid++;
      continue;
    }

    if (existingNumbers.has(levelNumber)) {
      skipped++;
      continue;
    }

    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) {
      invalid++;
      continue;
    }

    newLevels.push({
      game_id: gameId,
      level_number: levelNumber,
      title,
      youtube_url: youtubeUrl,
      youtube_id: youtubeId,
      walkthrough,
      tips,
      description,
      published: true,
    });

    existingNumbers.add(levelNumber);
  }

  if (newLevels.length === 0) {
    return { error: `No valid levels to import. Skipped: ${skipped}, Invalid: ${invalid}` };
  }

  const game = await getGameSlug(gameId);
  if ('error' in game) return { error: game.error };

  const { error } = await supabaseAdmin.from('levels').insert(newLevels);

  if (error) {
    return { error: error.message };
  }

  await updateGameLevelCount(gameId);

  revalidatePath(`/ms-control-9x7k2p/games/${gameId}/levels`);
  revalidatePath('/ms-control-9x7k2p/games');
  revalidatePublicLevelPaths(
    game.slug,
    newLevels.map((level) => level.level_number)
  );

  return { success: true, inserted: newLevels.length, skipped, invalid };
}

export type BulkJsonImportResult =
  | { success: false; error: string }
  | { success: true; created: number; updated: number };

type JsonLevelInput = {
  game_slug: string;
  level_number: number;
  youtube_url: string;
  description: string | null;
  walkthrough: string | null;
  tips: string | null;
};

export async function bulkImportLevelsJson(
  _previousState: BulkJsonImportResult | null,
  formData: FormData
): Promise<BulkJsonImportResult> {
  await requireAuth();

  const json = formData.get('levels_json');
  if (typeof json !== 'string' || !json.trim()) {
    return { success: false, error: 'Paste a JSON array of levels to import.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { success: false, error: 'Invalid JSON. Check the syntax and try again.' };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { success: false, error: 'The JSON must be a non-empty array of levels.' };
  }

  if (parsed.length > 1000) {
    return { success: false, error: 'Import at most 1,000 levels at a time.' };
  }

  const levels: JsonLevelInput[] = [];
  const uniqueKeys = new Set<string>();

  for (const [index, value] of parsed.entries()) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { success: false, error: `Level at array index ${index} must be an object.` };
    }

    const row = value as Record<string, unknown>;
    const gameSlug = typeof row.game_slug === 'string' ? row.game_slug.trim() : '';
    const levelNumber = row.level_number;
    const youtubeUrl = typeof row.youtube_url === 'string' ? row.youtube_url.trim() : '';
    const youtubeId = extractYoutubeId(youtubeUrl);

    if (!gameSlug) {
      return { success: false, error: `Level at array index ${index} needs a game_slug.` };
    }
    if (!Number.isInteger(levelNumber) || (levelNumber as number) < 1 || (levelNumber as number) > 100000) {
      return { success: false, error: `Level at array index ${index} has an invalid level_number.` };
    }
    if (!youtubeId) {
      return { success: false, error: `Level at array index ${index} has an invalid YouTube URL.` };
    }

    for (const field of ['description', 'walkthrough', 'tips'] as const) {
      if (row[field] !== undefined && row[field] !== null && typeof row[field] !== 'string') {
        return { success: false, error: `The ${field} field at array index ${index} must be text.` };
      }
    }

    const key = `${gameSlug.toLowerCase()}:${levelNumber}`;
    if (uniqueKeys.has(key)) {
      return { success: false, error: `Duplicate game_slug and level_number at array index ${index}.` };
    }
    uniqueKeys.add(key);

    levels.push({
      game_slug: gameSlug,
      level_number: levelNumber as number,
      youtube_url: youtubeUrl,
      description: typeof row.description === 'string' ? row.description.trim() || null : null,
      walkthrough: typeof row.walkthrough === 'string' ? row.walkthrough.trim() || null : null,
      tips: typeof row.tips === 'string' ? row.tips.trim() || null : null,
    });
  }

  const gameSlugs = [...new Set(levels.map((level) => level.game_slug))];
  const { data: games, error: gamesError } = await supabaseAdmin
    .from('games')
    .select('id, slug')
    .in('slug', gameSlugs);

  if (gamesError) {
    return { success: false, error: `Could not look up games: ${gamesError.message}` };
  }

  const gamesBySlug = new Map((games || []).map((game) => [game.slug, game]));
  const missingSlugs = gameSlugs.filter((slug) => !gamesBySlug.has(slug));
  if (missingSlugs.length) {
    return {
      success: false,
      error: `Unknown game_slug value(s): ${missingSlugs.join(', ')}.`,
    };
  }

  const rows = levels.map((level) => ({
    ...level,
    game_id: gamesBySlug.get(level.game_slug)!.id,
    youtube_id: extractYoutubeId(level.youtube_url),
  }));
  const gameIds = [...new Set(rows.map((row) => row.game_id))];
  const { data: existingLevels, error: existingError } = await supabaseAdmin
    .from('levels')
    .select('id, game_id, level_number')
    .in('game_id', gameIds)
    .in('level_number', [...new Set(rows.map((row) => row.level_number))]);

  if (existingError) {
    return { success: false, error: `Could not check existing levels: ${existingError.message}` };
  }

  const existingByKey = new Map(
    (existingLevels || []).map((level) => [`${level.game_id}:${level.level_number}`, level])
  );
  const updates = rows.filter((row) => existingByKey.has(`${row.game_id}:${row.level_number}`));
  const inserts = rows.filter((row) => !existingByKey.has(`${row.game_id}:${row.level_number}`));

  for (const row of updates) {
    const existing = existingByKey.get(`${row.game_id}:${row.level_number}`)!;
    const { error } = await supabaseAdmin
      .from('levels')
      .update({
        youtube_url: row.youtube_url,
        youtube_id: row.youtube_id,
        description: row.description,
        walkthrough: row.walkthrough,
        tips: row.tips,
        published: true,
      })
      .eq('id', existing.id);

    if (error) {
      return {
        success: false,
        error: `Import stopped while updating ${row.game_slug} Level ${row.level_number}: ${error.message}`,
      };
    }
  }

  if (inserts.length) {
    const { error } = await supabaseAdmin.from('levels').insert(
      inserts.map((row) => ({
        game_id: row.game_id,
        level_number: row.level_number,
        title: `Level ${row.level_number}`,
        slug: `level-${row.level_number}`,
        youtube_url: row.youtube_url,
        youtube_id: row.youtube_id,
        description: row.description,
        walkthrough: row.walkthrough,
        tips: row.tips,
        published: true,
      }))
    );

    if (error) {
      return { success: false, error: `Could not create new levels: ${error.message}` };
    }
  }

  const affectedGames = new Set(rows.map((row) => row.game_slug));
  for (const gameSlug of affectedGames) {
    const game = gamesBySlug.get(gameSlug)!;
    await updateGameLevelCount(game.id);
    revalidatePath(`/ms-control-9x7k2p/games/${game.id}/levels`);
    revalidatePublicLevelPaths(
      game.slug,
      rows.filter((row) => row.game_slug === gameSlug).map((row) => row.level_number)
    );
  }
  revalidatePath('/ms-control-9x7k2p/games');

  return { success: true, created: inserts.length, updated: updates.length };
}

// ==========================================
// HELPER — Game ke total_levels update karo
// ==========================================
async function updateGameLevelCount(gameId: string) {
  const { count } = await supabaseAdmin
    .from('levels')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', gameId);

  await supabaseAdmin
    .from('games')
    .update({ total_levels: count || 0 })
    .eq('id', gameId);
}