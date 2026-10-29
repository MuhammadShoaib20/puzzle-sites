'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/require-auth';
import { supabaseAdmin } from '@/lib/supabase';

const MAX_IMAGE_SIZE = 5_000_000;
const MAX_TOTAL_SIZE = 49_000_000;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

type SkippedImage = {
  fileName: string;
  reason: string;
};

export type BulkBlogImagesResult = {
  success: boolean;
  updatedSlugs?: string[];
  skippedImages?: SkippedImage[];
  error?: string;
};

export async function bulkUploadBlogImages(formData: FormData): Promise<BulkBlogImagesResult> {
  try {
    await requireAuth();

    const entries = formData.getAll('images');
    if (entries.some((entry) => typeof entry !== 'string' && !(entry instanceof File))) {
      return { success: false, error: 'Please select valid image files.' };
    }

    const files = entries.filter(
      (entry): entry is File => entry instanceof File && entry.size > 0
    );
    if (files.length === 0) {
      return { success: false, error: 'Please select at least one image.' };
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE) {
      return { success: false, error: 'The total image upload size must be smaller than 49 MB.' };
    }

    const skippedImages: SkippedImage[] = [];
    const validFiles: { file: File; slug: string; extension: string }[] = [];
    const seenSlugs = new Set<string>();

    for (const file of files) {
      const extension = file.name.match(/\.[^.]+$/)?.[0].toLowerCase();
      const expectedType = extension ? ALLOWED_IMAGE_TYPES[extension] : undefined;
      if (!extension || !expectedType || (file.type && file.type !== expectedType)) {
        skippedImages.push({
          fileName: file.name || '(unnamed file)',
          reason: 'Unsupported image type. Use JPG, PNG, or WebP.',
        });
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        skippedImages.push({
          fileName: file.name,
          reason: 'Image exceeds the 5 MB limit.',
        });
        continue;
      }

      const slug = file.name.slice(0, -extension.length);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        skippedImages.push({
          fileName: file.name,
          reason: 'Filename must be an exact blog slug followed by its image extension.',
        });
        continue;
      }
      if (seenSlugs.has(slug)) {
        skippedImages.push({
          fileName: file.name,
          reason: `Another selected image already uses the slug "${slug}".`,
        });
        continue;
      }

      seenSlugs.add(slug);
      validFiles.push({ file, slug, extension });
    }

    const blogsBySlug = new Map<string, { id: string; slug: string }>();
    const slugs = validFiles.map(({ slug }) => slug);
    for (let offset = 0; offset < slugs.length; offset += 100) {
      const { data: blogs, error } = await supabaseAdmin
        .from('blogs')
        .select('id, slug')
        .in('slug', slugs.slice(offset, offset + 100));

      if (error) {
        console.error('Bulk blog image lookup failed:', error);
        return { success: false, error: 'Could not look up blogs for the selected images.' };
      }
      for (const blog of blogs || []) {
        blogsBySlug.set(blog.slug, blog);
      }
    }

    const updatedSlugs: string[] = [];
    for (const { file, slug, extension } of validFiles) {
      const blog = blogsBySlug.get(slug);
      if (!blog) {
        skippedImages.push({
          fileName: file.name,
          reason: `No blog was found with the slug "${slug}".`,
        });
        continue;
      }

      const storagePath = `blogs/${slug}-${randomUUID()}${extension}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('images')
        .upload(storagePath, file, {
          cacheControl: '31536000',
          contentType: ALLOWED_IMAGE_TYPES[extension],
          upsert: false,
        });

      if (uploadError) {
        console.error(`Bulk blog image upload failed for "${file.name}":`, uploadError);
        skippedImages.push({
          fileName: file.name,
          reason: 'Image upload to Supabase Storage failed.',
        });
        continue;
      }

      const { data: publicUrl } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(storagePath);
      const { error: updateError } = await supabaseAdmin
        .from('blogs')
        .update({ cover_image: publicUrl.publicUrl })
        .eq('id', blog.id);

      if (updateError) {
        console.error(`Bulk blog cover image update failed for "${file.name}":`, updateError);
        const { error: cleanupError } = await supabaseAdmin.storage
          .from('images')
          .remove([storagePath]);
        if (cleanupError) {
          console.error(`Bulk blog image cleanup failed for "${file.name}":`, cleanupError);
        }
        skippedImages.push({
          fileName: file.name,
          reason: 'Image uploaded, but the blog cover image could not be updated.',
        });
        continue;
      }

      updatedSlugs.push(slug);
    }

    if (updatedSlugs.length > 0) {
      revalidatePath('/blog');
      revalidatePath('/admin/blogs');
      revalidatePath('/ms-control-9x7k2p/blogs');
      revalidatePath('/blog/[slug]', 'page');
      for (const slug of updatedSlugs) {
        revalidatePath(`/blog/${slug}`);
      }
    }

    return { success: true, updatedSlugs, skippedImages };
  } catch (error) {
    console.error('Bulk blog image upload error:', error);
    if (error instanceof Error && error.message.startsWith('Unauthorized:')) {
      return { success: false, error: 'You must be signed in as an admin to upload images.' };
    }
    return { success: false, error: 'An unexpected error occurred while uploading images.' };
  }
}
