import { canonicalUrl } from '@/lib/seo';
import { createUrlSetResponse, type SitemapUrl } from '@/lib/sitemap-xml';

export const revalidate = 86400;

export function GET(): Response {
  const lastModified = new Date();
  const pages: SitemapUrl[] = [
    { url: canonicalUrl('/'), lastModified, changeFrequency: 'daily', priority: 1 },
    { url: canonicalUrl('/about'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: canonicalUrl('/contact'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: canonicalUrl('/privacy'), lastModified, changeFrequency: 'yearly', priority: 0.8 },
  ];

  return createUrlSetResponse(pages);
}
