'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { makeSlug } from '@/lib/utils';
import { requireAuth } from '@/lib/require-auth';
import type { CustomButton, FAQ } from '@/types';

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    slug?: string;
    short_description?: string;
    full_description?: string;
    youtube_trailer_url?: string;
    youtube_channel_url?: string;
  };
  data?: unknown;
};

function parseArray(raw: FormDataEntryValue | null): unknown[] {
  if (typeof raw !== 'string') return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function parseFaq(raw: FormDataEntryValue | null): FAQ[] {
  return parseArray(raw)
    .filter(
      (item): item is { q: string; a: string } =>
        !!item &&
        typeof item === 'object' &&
        'q' in item &&
        'a' in item &&
        typeof item.q === 'string' &&
        typeof item.a === 'string'
    )
    .map(({ q, a }) => ({ q: q.trim().slice(0, 500), a: a.trim().slice(0, 4000) }))
    .filter(({ q, a }) => q.length > 0 && a.length > 0)
    .slice(0, 50);
}

function parseCustomButtons(raw: FormDataEntryValue | null): CustomButton[] {
  return parseArray(raw)
    .filter(
      (item): item is { label: string; url: string; newTab?: unknown } =>
        !!item &&
        typeof item === 'object' &&
        'label' in item &&
        'url' in item &&
        typeof item.label === 'string' &&
        typeof item.url === 'string'
    )
    .map(({ label, url, newTab }) => ({
      label: label.trim().slice(0, 100),
      url: url.trim(),
      newTab: newTab !== false,
    }))
    .filter(({ label, url }) => {
      if (!label || !url || url.length > 2048) return false;
      try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      } catch {
        return false;
      }
    })
    .slice(0, 20);
}

function extractGameData(formData: FormData) {
  const name = ((formData.get('name') as string) || '').trim();
  return {
    name,
    slug: ((formData.get('slug') as string) || makeSlug(name)).trim(),
    // Only touch category_id when the form actually sends it, so editing a
    // game never wipes a category that was set elsewhere (e.g. via SQL).
    ...(formData.has('category_id')
      ? { category_id: (formData.get('category_id') as string) || null }
      : {}),
    cover_image: (formData.get('cover_image') as string) || null,
    short_description: (formData.get('short_description') as string) || null,
    full_description: (formData.get('full_description') as string) || null,
    walkthrough_intro: (formData.get('walkthrough_intro') as string) || null,
    youtube_trailer_url: (formData.get('youtube_trailer_url') as string) || null,
    youtube_channel_url: (formData.get('youtube_channel_url') as string) || null,
    meta_title: (formData.get('meta_title') as string) || null,
    meta_description: (formData.get('meta_description') as string) || null,
    operating_system:
      ((formData.get('operating_system') as string) || 'Android, iOS').trim(),
    keywords: ((formData.get('keywords') as string) || '')
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    faq: parseFaq(formData.get('faq_json')),
    custom_buttons: parseCustomButtons(formData.get('custom_buttons_json')),
    published: formData.get('published') === 'on',
  };
}

function validateGameData(data: ReturnType<typeof extractGameData>): { valid: boolean; fieldErrors?: ActionResult['fieldErrors'] } {
  const fieldErrors: ActionResult['fieldErrors'] = {};

  // Validate name
  if (!data.name || data.name.length < 3) {
    fieldErrors.name = 'Game name must be at least 3 characters.';
  } else if (data.name.length > 100) {
    fieldErrors.name = 'Game name must be less than 100 characters.';
  }

  // Validate slug
  if (!data.slug || data.slug.length < 3) {
    fieldErrors.slug = 'Slug must be at least 3 characters.';
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    fieldErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens.';
  }

  // Validate descriptions
  if (data.short_description && data.short_description.length > 500) {
    fieldErrors.short_description = 'Short description must be less than 500 characters.';
  }
  if (data.full_description && data.full_description.length > 5000) {
    fieldErrors.full_description = 'Full description must be less than 5000 characters.';
  }

  // Validate YouTube URLs
  if (data.youtube_trailer_url) {
    if (!isValidYouTubeUrl(data.youtube_trailer_url)) {
      fieldErrors.youtube_trailer_url = 'Invalid YouTube trailer URL format.';
    }
  }
  if (data.youtube_channel_url) {
    if (!isValidYouTubeUrl(data.youtube_channel_url)) {
      fieldErrors.youtube_channel_url = 'Invalid YouTube channel URL format.';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }

  return { valid: true };
}

function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const query = supabaseAdmin
    .from('games')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query.neq('id', excludeId);
  }

  const { data } = await query.limit(1);
  return (data || []).length > 0;
}

async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await checkSlugExists(slug, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createGame(formData: FormData): Promise<ActionResult> {
  try {
    await requireAuth();

    const data = extractGameData(formData);

    // Server-side validation
    const validation = validateGameData(data);
    if (!validation.valid) {
      return { success: false, error: 'Please fix the errors below.', fieldErrors: validation.fieldErrors };
    }

    // Check for duplicate slug
    let slug = data.slug;
    if (await checkSlugExists(slug)) {
      slug = await generateUniqueSlug(slug);
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('games')
      .insert({ ...data, slug })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') {
        return { success: false, error: 'A game with this slug already exists. Please choose a different one.' };
      }
      return { success: false, error: 'Failed to create game. Please try again.' };
    }

    revalidatePath('/ms-control-9x7k2p/games');
    revalidatePath('/');
    return { success: true, data: inserted };
  } catch (error) {
    console.error('Create game error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateGame(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireAuth();

    const data = extractGameData(formData);

    // Server-side validation
    const validation = validateGameData(data);
    if (!validation.valid) {
      return { success: false, error: 'Please fix the errors below.', fieldErrors: validation.fieldErrors };
    }

    // Check for duplicate slug (excluding current game)
    let slug = data.slug;
    if (await checkSlugExists(slug, id)) {
      slug = await generateUniqueSlug(slug, id);
    }

    const { error } = await supabaseAdmin
      .from('games')
      .update({
        ...data,
        slug,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') {
        return { success: false, error: 'A game with this slug already exists. Please choose a different one.' };
      }
      return { success: false, error: 'Failed to update game. Please try again.' };
    }

    revalidatePath('/ms-control-9x7k2p/games');
    revalidatePath(`/game/${slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Update game error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function deleteGame(id: string): Promise<ActionResult> {
  try {
    await requireAuth();

    // Check if game has levels
    const { data: levels } = await supabaseAdmin
      .from('levels')
      .select('id')
      .eq('game_id', id);

    if (levels && levels.length > 0) {
      return {
        success: false,
        error: `This game has ${levels.length} level${levels.length > 1 ? 's' : ''}. Please delete all levels first.`,
      };
    }

    const { error } = await supabaseAdmin.from('games').delete().eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: 'Failed to delete game. Please try again.' };
    }

    revalidatePath('/ms-control-9x7k2p/games');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete game error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getGameLevelCount(id: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await requireAuth();

    const { data: levels } = await supabaseAdmin
      .from('levels')
      .select('id')
      .eq('game_id', id);

    return { success: true, count: (levels || []).length };
  } catch (error) {
    console.error('Get level count error:', error);
    return { success: false, error: 'Failed to get level count.' };
  }
}
