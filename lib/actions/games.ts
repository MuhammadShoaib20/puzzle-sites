'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { makeSlug } from '@/lib/utils';

export async function createGame(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = (formData.get('slug') as string) || makeSlug(name);
  const category_id = (formData.get('category_id') as string) || null;
  const cover_image = (formData.get('cover_image') as string) || null;
  const short_description = formData.get('short_description') as string;
  const full_description = formData.get('full_description') as string;
  const walkthrough_intro = formData.get('walkthrough_intro') as string;
  const youtube_trailer_url = formData.get('youtube_trailer_url') as string;
  const youtube_channel_url = formData.get('youtube_channel_url') as string;
  const meta_title = formData.get('meta_title') as string;
  const meta_description = formData.get('meta_description') as string;
  const keywordsRaw = formData.get('keywords') as string;
  const keywords = keywordsRaw
    ? keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
  const published = formData.get('published') === 'on';

  const { error } = await supabaseAdmin.from('games').insert({
    name,
    slug,
    category_id,
    cover_image,
    short_description,
    full_description,
    walkthrough_intro,
    youtube_trailer_url,
    youtube_channel_url,
    meta_title,
    meta_description,
    keywords,
    published,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/games');
  revalidatePath('/');
  redirect('/admin/games');
}

export async function updateGame(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const category_id = (formData.get('category_id') as string) || null;
  const cover_image = (formData.get('cover_image') as string) || null;
  const short_description = formData.get('short_description') as string;
  const full_description = formData.get('full_description') as string;
  const walkthrough_intro = formData.get('walkthrough_intro') as string;
  const youtube_trailer_url = formData.get('youtube_trailer_url') as string;
  const youtube_channel_url = formData.get('youtube_channel_url') as string;
  const meta_title = formData.get('meta_title') as string;
  const meta_description = formData.get('meta_description') as string;
  const keywordsRaw = formData.get('keywords') as string;
  const keywords = keywordsRaw
    ? keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
  const published = formData.get('published') === 'on';

  const { error } = await supabaseAdmin
    .from('games')
    .update({
      name,
      slug,
      category_id,
      cover_image,
      short_description,
      full_description,
      walkthrough_intro,
      youtube_trailer_url,
      youtube_channel_url,
      meta_title,
      meta_description,
      keywords,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/games');
  revalidatePath(`/game/${slug}`);
  revalidatePath('/');
  redirect('/admin/games');
}

export async function deleteGame(id: string) {
  const { error } = await supabaseAdmin.from('games').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/games');
  revalidatePath('/');
}