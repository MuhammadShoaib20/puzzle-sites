import type { MetadataRoute } from 'next';
import {
  getAllGames,
  getAllBlogs,
  getAllCategories,
  getAllPublishedLevelsForSitemap,
  getAllPublishedPagesForSitemap,
} from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, blogs, categories, allLevels, pages] = await Promise.all([
    getAllGames(),
    getAllBlogs(),
    getAllCategories(),
    getAllPublishedLevelsForSitemap(),
    getAllPublishedPagesForSitemap(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  const pageUrls: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${SITE_URL}/${page.slug}`,
    lastModified: new Date(page.updated_at || page.created_at),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Game pages
  const gamePages: MetadataRoute.Sitemap = games.map((g) => ({
    url: `${SITE_URL}/game/${g.slug}`,
    lastModified: new Date(g.created_at),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const levelPages: MetadataRoute.Sitemap = allLevels.map((level) => ({
    url: `${SITE_URL}/game/${level.game_slug}/level-${level.level_number}`,
    lastModified: new Date(level.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: new Date(b.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
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