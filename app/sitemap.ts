import type { MetadataRoute } from 'next';
import { getAllGames, getAllBlogs, getLevelsByGame } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3000';

  const [games, blogs] = await Promise.all([getAllGames(), getAllBlogs()]);

  const gameUrls: MetadataRoute.Sitemap = games.map((g) => ({
    url: `${baseUrl}/game/${g.slug}`,
    lastModified: new Date(g.created_at),
    priority: 0.9,
  }));

  const levelUrls: MetadataRoute.Sitemap = [];
  for (const game of games) {
    const levels = await getLevelsByGame(game.id);
    for (const level of levels) {
      levelUrls.push({
        url: `${baseUrl}/game/${game.slug}/level-${level.level_number}`,
        lastModified: new Date(level.created_at),
        priority: 0.7,
      });
    }
  }

  const blogUrls: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: new Date(b.created_at),
    priority: 0.8,
  }));

  return [
    { url: baseUrl, priority: 1 },
    { url: `${baseUrl}/blog`, priority: 0.9 },
    ...gameUrls,
    ...levelUrls,
    ...blogUrls,
  ];
}