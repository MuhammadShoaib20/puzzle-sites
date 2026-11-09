import {
  getAllPublishedGamesForSitemap,
  getPublishedLevelsForGameForSitemap,
} from '@/lib/db';
import { canonicalUrl } from '@/lib/seo';
import { createUrlSetResponse } from '@/lib/sitemap-xml';

export const revalidate = 86400;

export async function GET(): Promise<Response> {
  const games = await getAllPublishedGamesForSitemap();
  const levels = [];
  const batchSize = 10;

  for (let index = 0; index < games.length; index += batchSize) {
    const batch = games.slice(index, index + batchSize);
    const batchLevels = await Promise.all(
      batch.map((game) => getPublishedLevelsForGameForSitemap(game.id, game.slug))
    );
    levels.push(...batchLevels.flat());
  }

  return createUrlSetResponse(
    levels.map((level) => ({
      url: canonicalUrl(`/game/${level.game_slug}/level-${level.level_number}`),
      lastModified: level.updated_at || level.created_at,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  );
}
