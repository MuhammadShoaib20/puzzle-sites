import { getAllPublishedGamesForSitemap } from '@/lib/db';
import { canonicalUrl } from '@/lib/seo';
import { createUrlSetResponse } from '@/lib/sitemap-xml';

export const revalidate = 86400;

export async function GET(): Promise<Response> {
  const games = await getAllPublishedGamesForSitemap();

  return createUrlSetResponse(
    games.map((game) => ({
      url: canonicalUrl(`/game/${game.slug}`),
      lastModified: game.updated_at || game.created_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  );
}
