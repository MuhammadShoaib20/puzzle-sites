import { createSitemapIndexResponse } from '@/lib/sitemap-xml';

export const revalidate = 86400;

export function GET(): Response {
  return createSitemapIndexResponse([
    '/pages-sitemap.xml',
    '/blog-sitemap.xml',
    '/games-sitemap.xml',
    '/levels-sitemap.xml',
  ]);
}
