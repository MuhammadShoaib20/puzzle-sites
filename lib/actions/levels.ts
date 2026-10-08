'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { extractYoutubeId } from '@/lib/utils';

// ==========================================
// BULK GENERATE — Level 1 se N tak
// ==========================================
export async function bulkGenerateLevels(gameId: string, formData: FormData) {
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
  const { error } = await supabaseAdmin.from('levels').delete().eq('id', levelId);

  if (error) {
    return { error: error.message };
  }

  await updateGameLevelCount(gameId);

  revalidatePath(`/admin/games/${gameId}/levels`);
  revalidatePath('/admin/games');
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