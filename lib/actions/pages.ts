'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { makeSlug } from '@/lib/utils';
import { requireAuth } from '@/lib/require-auth';

function getString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function getPageValues(formData: FormData) {
  const title = getString(formData, 'title');
  const slug = makeSlug(getString(formData, 'slug') || title);
  const sortOrderRaw = getString(formData, 'sort_order');
  const sortOrder = sortOrderRaw === '' ? 0 : Number(sortOrderRaw);

  if (!title) return { error: 'Title is required.' as const };
  if (!slug) return { error: 'A valid slug is required.' as const };
  if (!Number.isInteger(sortOrder)) {
    return { error: 'Sort order must be a whole number.' as const };
  }

  return {
    values: {
      title,
      slug,
      content: getString(formData, 'content'),
      meta_title: getString(formData, 'meta_title') || null,
      meta_description: getString(formData, 'meta_description') || null,
      is_published: formData.get('is_published') === 'on',
      show_in_footer: formData.get('show_in_footer') === 'on',
      sort_order: sortOrder,
    },
  };
}

function revalidatePagePaths(slug?: string) {
  revalidatePath('/ms-control-9x7k2p/pages');
  revalidatePath('/sitemap.xml');
  revalidatePath('/', 'layout');
  if (slug) {
    revalidatePath(`/${slug}`);
    if (slug === 'privacy') revalidatePath('/privacy-policy');
  }
}

export async function createPage(formData: FormData) {
  await requireAuth();

  const result = getPageValues(formData);
  if ('error' in result) return result;

  const { error } = await supabaseAdmin.from('pages').insert(result.values);
  if (error) return { error: error.message };

  revalidatePagePaths(result.values.slug);
  redirect('/ms-control-9x7k2p/pages');
}

export async function updatePage(id: string, formData: FormData) {
  await requireAuth();

  const result = getPageValues(formData);
  if ('error' in result) return result;

  const { data: existingPage, error: lookupError } = await supabaseAdmin
    .from('pages')
    .select('slug')
    .eq('id', id)
    .maybeSingle();
  if (lookupError) return { error: lookupError.message };
  if (!existingPage) return { error: 'Page not found.' };

  const { error } = await supabaseAdmin
    .from('pages')
    .update({
      ...result.values,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePagePaths(existingPage.slug);
  revalidatePagePaths(result.values.slug);
  redirect('/ms-control-9x7k2p/pages');
}

export async function deletePage(id: string) {
  await requireAuth();

  const { data: page, error: lookupError } = await supabaseAdmin
    .from('pages')
    .select('slug')
    .eq('id', id)
    .maybeSingle();
  if (lookupError) return { error: lookupError.message };
  if (!page) return { error: 'Page not found.' };

  const { error } = await supabaseAdmin.from('pages').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePagePaths(page.slug);
}
