'use server';

import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';
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

type BulkImportResult = {
  success: boolean;
  importedCount?: number;
  error?: string;
};

const BLOG_CSV_HEADERS = [
  'title',
  'slug',
  'related_game',
  'content',
  'meta_title',
  'meta_description',
  'keywords',
  'published',
] as const;

type BlogCsvRow = Record<(typeof BLOG_CSV_HEADERS)[number], string>;

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

export async function bulkImportBlogs(formData: FormData): Promise<BulkImportResult> {
  try {
    await requireAuth();

    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: 'Please select a non-empty CSV file.' };
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return { success: false, error: 'Please upload a file with the .csv extension.' };
    }
    if (file.size > 4_900_000) {
      return { success: false, error: 'CSV files must be smaller than 4.9 MB.' };
    }

    const csv = await file.text();
    const parsed = Papa.parse<BlogCsvRow>(csv, {
      header: true,
      skipEmptyLines: 'greedy',
    });

    if (parsed.errors.length > 0) {
      const firstError = parsed.errors[0];
      return {
        success: false,
        error: `Invalid CSV near row ${(firstError.row ?? 0) + 2}: ${firstError.message}`,
      };
    }

    const headers = parsed.meta.fields || [];
    const expectedHeaders = new Set<string>(BLOG_CSV_HEADERS);
    const unexpectedHeaders = headers.filter((header) => !expectedHeaders.has(header));
    const missingHeaders = BLOG_CSV_HEADERS.filter((header) => !headers.includes(header));
    if (
      parsed.meta.renamedHeaders &&
      Object.keys(parsed.meta.renamedHeaders).length > 0
    ) {
      return { success: false, error: 'The CSV contains duplicate column names.' };
    }
    if (unexpectedHeaders.length > 0 || missingHeaders.length > 0 || headers.length !== BLOG_CSV_HEADERS.length) {
      const details = [
        missingHeaders.length > 0 ? `missing: ${missingHeaders.join(', ')}` : '',
        unexpectedHeaders.length > 0 ? `unexpected: ${unexpectedHeaders.join(', ')}` : '',
      ].filter(Boolean);
      return {
        success: false,
        error: `The CSV must contain exactly these columns: ${BLOG_CSV_HEADERS.join(', ')}.${details.length ? ` ${details.join('; ')}.` : ''}`,
      };
    }
    if (parsed.data.length === 0) {
      return { success: false, error: 'The CSV does not contain any blog rows.' };
    }

    const rows = parsed.data.map((row, index) => ({
      rowNumber: index + 2,
      title: (row.title || '').trim(),
      slug: (row.slug || '').trim(),
      gameSlug: (row.related_game || '').trim(),
      content: (row.content || '').trim(),
      metaTitle: (row.meta_title || '').trim(),
      metaDescription: (row.meta_description || '').trim(),
      keywords: (row.keywords || '')
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      published: (row.published || '').trim().toLowerCase() === 'true',
    }));

    const slugs = new Set<string>();
    for (const row of rows) {
      const missingFields = [
        !row.title ? 'title' : '',
        !row.slug ? 'slug' : '',
        !row.content ? 'content' : '',
      ].filter(Boolean);
      if (missingFields.length > 0) {
        return {
          success: false,
          error: `Row ${row.rowNumber} is missing required values: ${missingFields.join(', ')}.`,
        };
      }
      if (!/^[a-z0-9-]+$/.test(row.slug)) {
        return {
          success: false,
          error: `Row ${row.rowNumber} has an invalid slug. Use lowercase letters, numbers, and hyphens only.`,
        };
      }
      if (slugs.has(row.slug)) {
        return { success: false, error: `The CSV contains the duplicate slug "${row.slug}".` };
      }
      slugs.add(row.slug);
    }

    const gameSlugs = [...new Set(rows.map((row) => row.gameSlug).filter(Boolean))];
    const gameIds = new Map<string, string>();
    if (gameSlugs.length > 0) {
      const { data: games, error } = await supabaseAdmin
        .from('games')
        .select('id, slug')
        .in('slug', gameSlugs);

      if (error) {
        console.error('Bulk blog import game lookup error:', error);
        return { success: false, error: 'Could not match game slugs. Please try again.' };
      }
      for (const game of games || []) {
        gameIds.set(game.slug, game.id);
      }
    }

    const blogsData = [];
    for (const row of rows) {
      const gameId = row.gameSlug ? gameIds.get(row.gameSlug) : null;
      if (row.gameSlug && !gameId) {
        return {
          success: false,
          error: `Row ${row.rowNumber} refers to unknown game slug "${row.gameSlug}".`,
        };
      }
      blogsData.push({
        title: row.title,
        slug: row.slug,
        game_id: gameId || null,
        content: row.content,
        cover_image: null,
        meta_title: row.metaTitle || null,
        meta_description: row.metaDescription || null,
        keywords: row.keywords,
        published: row.published,
      });
    }

    const { error } = await supabaseAdmin
      .from('blogs')
      .upsert(blogsData, { onConflict: 'slug' });

    if (error) {
      console.error('Bulk blog import database error:', error);
      return { success: false, error: 'Failed to import blogs. Please check the CSV and try again.' };
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blogs');
    revalidatePath('/ms-control-9x7k2p/blogs');
    revalidatePath('/sitemap.xml');
    for (const slug of slugs) {
      revalidatePath(`/blog/${slug}`);
    }

    return { success: true, importedCount: blogsData.length };
  } catch (error) {
    console.error('Bulk blog import error:', error);
    if (error instanceof Error && error.message.startsWith('Unauthorized:')) {
      return { success: false, error: 'You must be signed in as an admin to import blogs.' };
    }
    return { success: false, error: 'An unexpected error occurred while importing blogs.' };
  }
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