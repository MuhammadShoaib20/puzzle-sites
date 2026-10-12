import type { Metadata } from 'next';
import type { Page } from '@/types';

export function getPageMetadata(page: Page | null): Metadata {
  if (!page) return {};

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
    alternates: { canonical: `/${page.slug}` },
  };
}
