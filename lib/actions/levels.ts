'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { extractYoutubeId } from '@/lib/utils';
import { requireAuth } from '@/lib/require-auth';

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

    // Upsert all levels (insert or update based on game_id, level_number)
    const { error } = await supabaseAdmin
      .from('levels')
      .upsert(levels, { onConflict: 'game_id,level_number' });

    if (error) {
      return { error: error.message };
    }

    // Update game's total_levels count
    await updateGameLevelCount(gameId);

    revalidatePath(`/admin/games/${gameId}/levels`);
    revalidatePath(`/game/[slug]`);
    redirect(`/admin/games/${gameId}/levels`);
  } catch (e) {
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
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId);

  await supabaseAdmin
    .from('games')
    .update({ total_levels: count || 0 })
    .eq('id', gameId);

  revalidatePath(`/admin/games/${gameId}/levels`);
  revalidatePath('/admin/games');
  redirect(`/admin/games/${gameId}/levels`);
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

  revalidatePath(`/admin/games/${gameId}/levels`);
  redirect(`/admin/games/${gameId}/levels`);
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

  revalidatePath(`/admin/games/${gameId}/levels`);
  revalidatePath(`/admin/games/${gameId}/levels/${levelId}/edit`);
  redirect(`/admin/games/${gameId}/levels`);
}

// ==========================================
// DELETE LEVEL
// ==========================================
export async function deleteLevel(levelId: string, gameId: string) {
  await requireAuth();

  const { error } = await supabaseAdmin.from('levels').delete().eq('id', levelId);

  if (error) {
    return { error: error.message };
  }

  await updateGameLevelCount(gameId);

  revalidatePath(`/admin/games/${gameId}/levels`);
  revalidatePath('/admin/games');
}

// ==========================================
// BULK IMPORT FROM CSV
// ==========================================
export async function bulkImportLevels(gameId: string, levelsJson: string) {
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

  const { error } = await supabaseAdmin.from('levels').insert(newLevels);

  if (error) {
    return { error: error.message };
  }

  await updateGameLevelCount(gameId);

  revalidatePath(`/admin/games/${gameId}/levels`);
  revalidatePath('/admin/games');

  return { success: true, inserted: newLevels.length, skipped, invalid };
}

// ==========================================
// HELPER — Game ke total_levels update karo
// ==========================================
async function updateGameLevelCount(gameId: string) {
  const { count } = await supabaseAdmin
    .from('levels')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId);

  await supabaseAdmin
    .from('games')
    .update({ total_levels: count || 0 })
    .eq('id', gameId);
}