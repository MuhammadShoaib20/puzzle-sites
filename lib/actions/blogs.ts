'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { makeSlug } from '@/lib/utils';
import { requireAuth } from '@/lib/require-auth';

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: {
    title?: string;
    slug?: string;
    content?: string;
  };
  data?: unknown;
};

function validateBlogData(data: {
  title: string;
  slug: string;
  content: string;
}): { valid: boolean; fieldErrors?: ActionResult['fieldErrors'] } {
  const fieldErrors: ActionResult['fieldErrors'] = {};

  // Validate title
  if (!data.title || data.title.length < 3) {
    fieldErrors.title = 'Title must be at least 3 characters.';
  } else if (data.title.length > 200) {
    fieldErrors.title = 'Title must be less than 200 characters.';
  }

  // Validate slug
  if (!data.slug || data.slug.length < 3) {
    fieldErrors.slug = 'Slug must be at least 3 characters.';
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    fieldErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens.';
  }

  // Validate content
  if (!data.content || data.content.length < 10) {
    fieldErrors.content = 'Content must be at least 10 characters.';
  } else if (data.content.length > 50000) {
    fieldErrors.content = 'Content must be less than 50,000 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }

  return { valid: true };
}

async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const query = supabaseAdmin
    .from('blogs')
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

function revalidateBlogPaths(...slugs: string[]) {
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  for (const slug of new Set(slugs)) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function createBlog(formData: FormData): Promise<ActionResult> {
  try {
    await requireAuth();

    const title = (formData.get('title') as string || '').trim();
    let slug = ((formData.get('slug') as string) || makeSlug(title)).trim();
    const game_id = (formData.get('game_id') as string) || null;
    const content = (formData.get('content') as string || '').trim();
    const cover_image = (formData.get('cover_image') as string) || null;
    const meta_title = (formData.get('meta_title') as string) || null;
    const meta_description = (formData.get('meta_description') as string) || null;
    const keywordsRaw = formData.get('keywords') as string;
    const keywords = keywordsRaw
      ? keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean)
      : [];
    const published = formData.get('published') === 'on';

    // Server-side validation
    const validation = validateBlogData({ title, slug, content });
    if (!validation.valid) {
      return { success: false, error: 'Please fix the errors below.', fieldErrors: validation.fieldErrors };
    }

    // Check for duplicate slug
    if (await checkSlugExists(slug)) {
      slug = await generateUniqueSlug(slug);
    }

    const { data: inserted, error } = await supabaseAdmin.from('blogs').insert({
      title,
      slug,
      game_id: game_id || null,
      content,
      cover_image,
      meta_title,
      meta_description,
      keywords,
      published,
    }).select().single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') {
        return { success: false, error: 'A blog with this slug already exists. Please choose a different one.' };
      }
      return { success: false, error: 'Failed to create blog. Please try again.' };
    }
    revalidatePath('/ms-control-9x7k2p/blogs');
    revalidateBlogPaths(slug);
    return { success: true, data: inserted };
  } catch (error) {
    console.error('Create blog error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateBlog(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireAuth();

    const title = (formData.get('title') as string || '').trim();
    let slug = ((formData.get('slug') as string) || makeSlug(title)).trim();
    const game_id = (formData.get('game_id') as string) || null;
    const content = (formData.get('content') as string || '').trim();
    const cover_image = (formData.get('cover_image') as string) || null;
    const meta_title = (formData.get('meta_title') as string) || null;
    const meta_description = (formData.get('meta_description') as string) || null;
    const keywordsRaw = formData.get('keywords') as string;
    const keywords = keywordsRaw
      ? keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean)
      : [];
    const published = formData.get('published') === 'on';

    // Server-side validation
    const validation = validateBlogData({ title, slug, content });
    if (!validation.valid) {
      return { success: false, error: 'Please fix the errors below.', fieldErrors: validation.fieldErrors };
    }

    // Check for duplicate slug (excluding current blog)
    if (await checkSlugExists(slug, id)) {
      slug = await generateUniqueSlug(slug, id);
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('blogs')
      .select('slug')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) {
      console.error('Supabase error:', lookupError);
      return { success: false, error: 'Failed to find blog. Please try again.' };
    }
    if (!existing) {
      return { success: false, error: 'Blog not found.' };
    }

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

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') {
        return { success: false, error: 'A blog with this slug already exists. Please choose a different one.' };
      }
      return { success: false, error: 'Failed to update blog. Please try again.' };
    }
    revalidatePath('/ms-control-9x7k2p/blogs');
    revalidateBlogPaths(existing.slug, slug);
    return { success: true };
  } catch (error) {
    console.error('Update blog error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function deleteBlog(id: string): Promise<ActionResult> {
  try {
    await requireAuth();

    const { data: blog, error: lookupError } = await supabaseAdmin
      .from('blogs')
      .select('slug')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) {
      console.error('Supabase error:', lookupError);
      return { success: false, error: 'Failed to find blog. Please try again.' };
    }
    if (!blog) {
      return { success: false, error: 'Blog not found.' };
    }

    const { error } = await supabaseAdmin.from('blogs').delete().eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: 'Failed to delete blog. Please try again.' };
    }
    revalidatePath('/ms-control-9x7k2p/blogs');
    revalidateBlogPaths(blog.slug);
    return { success: true };
  } catch (error) {
    console.error('Delete blog error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}