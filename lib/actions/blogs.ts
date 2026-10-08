'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { makeSlug } from '@/lib/utils';

export async function createBlog(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = (formData.get('slug') as string) || makeSlug(title);
  const game_id = (formData.get('game_id') as string) || null;
  const content = (formData.get('content') as string) || '';
  const cover_image = (formData.get('cover_image') as string) || null;
  const meta_title = (formData.get('meta_title') as string) || null;
  const meta_description = (formData.get('meta_description') as string) || null;
  const keywordsRaw = formData.get('keywords') as string;
  const keywords = keywordsRaw
    ? keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
  const published = formData.get('published') === 'on';

  if (!title) return { error: 'Title is required.' };

  const { error } = await supabaseAdmin.from('blogs').insert({
    title,
    slug,
    game_id: game_id || null,
    content,
    cover_image,
    meta_title,
    meta_description,
    keywords,
    published,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/blogs');
  revalidatePath('/blog');
  revalidatePath('/');
  redirect('/admin/blogs');
}

export async function updateBlog(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const game_id = (formData.get('game_id') as string) || null;
  const content = (formData.get('content') as string) || '';
  const cover_image = (formData.get('cover_image') as string) || null;
  const meta_title = (formData.get('meta_title') as string) || null;
  const meta_description = (formData.get('meta_description') as string) || null;
  const keywordsRaw = formData.get('keywords') as string;
  const keywords = keywordsRaw
    ? keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
  const published = formData.get('published') === 'on';

  const { error } = await supabaseAdmin
    .from('blogs')
    .update({
      title,
      slug,
      game_id: game_id || null,
      content,
      cover_image,
      meta_title,
      meta_description,
      keywords,
      published,
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/blogs');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/blog');
  redirect('/admin/blogs');
}

export async function deleteBlog(id: string) {
  const { error } = await supabaseAdmin.from('blogs').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/blogs');
  revalidatePath('/blog');
  revalidatePath('/');
}