import type { MetadataRoute } from 'next';
import {
  getAllPublishedGamesForSitemap,
  getAllPublishedBlogsForSitemap,
  getAllCategoriesForSitemap,
  getPublishedLevelsForGameForSitemap,
  getAllPublishedPagesForSitemap,
} from '@/lib/db';
import { canonicalUrl } from '@/lib/seo';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, blogs, categories, pages] = await Promise.all([
    getAllPublishedGamesForSitemap(),
    getAllPublishedBlogsForSitemap(),
    getAllCategoriesForSitemap(),
    getAllPublishedPagesForSitemap(),
  ]);
  const allLevels = (
    await Promise.all(
      games.map((game) => getPublishedLevelsForGameForSitemap(game.id, game.slug))
    )
  ).flat();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: canonicalUrl('/'), lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: canonicalUrl('/blog'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  const pageUrlsBySlug = new Map(
    ['about', 'contact', 'privacy', 'terms'].map((slug) => [
      canonicalUrl(`/${slug}`),
      {
        url: canonicalUrl(`/${slug}`),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ])
  );
  for (const page of pages) {
    if (page.slug.toLowerCase() === 'privacy-policy') continue;
    const url = canonicalUrl(`/${page.slug}`);
    pageUrlsBySlug.set(url, {
      url,
      lastModified: new Date(page.updated_at || page.created_at),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }
  const pageUrls: MetadataRoute.Sitemap = [...pageUrlsBySlug.values()];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: canonicalUrl(`/category/${category.slug}`),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Game pages
  const gamePages: MetadataRoute.Sitemap = games.map((g) => ({
    url: canonicalUrl(`/game/${g.slug}`),
    lastModified: new Date(g.updated_at || g.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const levelPages: MetadataRoute.Sitemap = allLevels.map((level) => ({
    url: canonicalUrl(`/game/${level.game_slug}/level-${level.level_number}`),
    lastModified: new Date(level.updated_at || level.created_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: canonicalUrl(`/blog/${b.slug}`),
    lastModified: new Date(b.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...pageUrls,
    ...categoryPages,
    ...gamePages,
    ...levelPages,
    ...blogPages,
  ];
}