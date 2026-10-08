'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { makeSlug } from '@/lib/utils';
import { requireAuth } from '@/lib/require-auth';
import type { CustomButton, FAQ } from '@/types';

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

export async function createGame(formData: FormData) {
  await requireAuth();

  const data = extractGameData(formData);
  if (!data.name) return { error: 'Game name is required.' };

  const { error } = await supabaseAdmin.from('games').insert(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/games');
  revalidatePath('/');
  redirect('/admin/games');
}

export async function updateGame(id: string, formData: FormData) {
  await requireAuth();

  const data = extractGameData(formData);
  if (!data.name) return { error: 'Game name is required.' };

  const { error } = await supabaseAdmin
    .from('games')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/games');
  revalidatePath(`/game/${data.slug}`);
  revalidatePath('/');
  redirect('/admin/games');
}

export async function deleteGame(id: string) {
  await requireAuth();

  const { error } = await supabaseAdmin.from('games').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/games');
  revalidatePath('/');
}
