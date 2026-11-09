import { CANONICAL_SITE_URL } from '@/lib/seo';

const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

export type SitemapUrl = {
  url: string;
  lastModified: Date | string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLastModified(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid sitemap lastModified date: ${value}`);
  }
  return date.toISOString();
}

function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}

export function createUrlSetResponse(entries: SitemapUrl[]): Response {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${escapeXml(formatLastModified(entry.lastModified))}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NAMESPACE}">\n${urls}\n</urlset>`
  );
}

export function createSitemapIndexResponse(sitemapPaths: string[]): Response {
  const lastModified = new Date().toISOString();
  const sitemaps = sitemapPaths
    .map((path) => {
      const location = new URL(path, CANONICAL_SITE_URL).toString();
      return `  <sitemap>
    <loc>${escapeXml(location)}</loc>
    <lastmod>${lastModified}</lastmod>
  </sitemap>`;
    })
    .join('\n');

  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="${SITEMAP_NAMESPACE}">\n${sitemaps}\n</sitemapindex>`
  );
}
