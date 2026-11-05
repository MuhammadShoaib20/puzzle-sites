import type { Metadata } from 'next';
import type { Page } from '@/types';
import { canonicalUrl } from '@/lib/seo';

export function getPageMetadata(
  page: Pick<Page, 'meta_title' | 'title' | 'meta_description' | 'slug'> | null,
  canonicalPath?: string
): Metadata {
  if (!page) return {};

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
    alternates: { canonical: canonicalUrl(canonicalPath || `/${page.slug}`) },
  };
}
