import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getGameBySlug,
  getLevelByNumber,
  getLevelsByGame,
  getSettings,
} from '@/lib/db';

type Props = { params: Promise<{ slug: string; levelSlug: string }> };

export const revalidate = 60;

function parseLevelNumber(levelSlug: string): number {
  const match = levelSlug.match(/^level-(\d+)$/);
  return match ? parseInt(match[1], 10) : NaN;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, levelSlug } = await params;
  const levelNumber = parseLevelNumber(levelSlug);
  if (isNaN(levelNumber)) return {};

  const game = await getGameBySlug(slug);
  if (!game) return {};

  const level = await getLevelByNumber(game.id, levelNumber);
  if (!level) return {};

  const title =
    level.meta_title ||
    `${game.name} Level ${level.level_number} Walkthrough & Solution`;
  const description =
    level.meta_description ||
    `Complete walkthrough for ${game.name} Level ${level.level_number}.`;

  return {
    title,
    description,
    alternates: { canonical: `/game/${game.slug}/level-${level.level_number}` },
    openGraph: {
      title,
      description,
      images: level.youtube_id
        ? [`https://i.ytimg.com/vi/${level.youtube_id}/maxresdefault.jpg`]
        : [],
      type: 'video.other',
    },
  };
}

export default async function LevelPage({ params }: Props) {
  const { slug, levelSlug } = await params;
  const levelNumber = parseLevelNumber(levelSlug);

  if (isNaN(levelNumber)) notFound();

  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const level = await getLevelByNumber(game.id, levelNumber);
  if (!level) notFound();

  const [allLevels, settings] = await Promise.all([
    getLevelsByGame(game.id),
    getSettings(),
  ]);

  const currentIndex = allLevels.findIndex((l) => l.level_number === levelNumber);
  const prevLevel = currentIndex > 0 ? allLevels[currentIndex - 1] : null;
  const nextLevel =
    currentIndex < allLevels.length - 1 ? allLevels[currentIndex + 1] : null;

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${game.name} Level ${level.level_number} Walkthrough`,
    description: level.description || level.title || '',
    thumbnailUrl: `https://i.ytimg.com/vi/${level.youtube_id}/maxresdefault.jpg`,
    uploadDate: level.created_at,
    embedUrl: `https://www.youtube.com/embed/${level.youtube_id}`,
    contentUrl: level.youtube_url,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: game.name, item: `/game/${game.slug}` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `Level ${level.level_number}`,
        item: `/game/${game.slug}/level-${level.level_number}`,
      },
    ],
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav className="text-sm text-gray-500 mb-4 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href={`/game/${game.slug}`} className="hover:text-blue-600">
          {game.name}
        </Link>
        <span>/</span>
        <span className="text-gray-700">Level {level.level_number}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        {game.name} Level {level.level_number} Walkthrough
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        {level.views} views · {new Date(level.created_at).toLocaleDateString()}
      </p>

      <div className="aspect-video rounded-xl overflow-hidden bg-black mb-4">
        <iframe
          src={`https://www.youtube.com/embed/${level.youtube_id}`}
          title={`${game.name} Level ${level.level_number}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href={level.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          ▶ {settings?.youtube_button_text || 'Watch on YouTube'}
        </a>
        <Link
          href={`/game/${game.slug}`}
          className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          🎮 All Levels
        </Link>
      </div>

      {settings?.adsense_in_article && (
        <div
          className="my-6"
          dangerouslySetInnerHTML={{ __html: settings.adsense_in_article }}
        />
      )}

      {level.description && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Overview</h2>
          <p className="text-gray-700">{level.description}</p>
        </section>
      )}

      {level.walkthrough && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Step-by-Step Walkthrough</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: level.walkthrough }}
          />
        </section>
      )}

      {level.tips && (
        <section className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-3">💡 Pro Tips</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: level.tips }}
          />
        </section>
      )}

      <nav className="flex justify-between items-center gap-3 mt-10 pt-6 border-t">
        {prevLevel ? (
          <Link
            href={`/game/${game.slug}/level-${prevLevel.level_number}`}
            className="flex-1 border rounded-lg px-4 py-3 hover:bg-gray-50 transition"
          >
            <div className="text-xs text-gray-500">← Previous</div>
            <div className="font-semibold">Level {prevLevel.level_number}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextLevel ? (
          <Link
            href={`/game/${game.slug}/level-${nextLevel.level_number}`}
            className="flex-1 border rounded-lg px-4 py-3 hover:bg-gray-50 transition text-right"
          >
            <div className="text-xs text-gray-500">Next →</div>
            <div className="font-semibold">Level {nextLevel.level_number}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>

      <div className="mt-6 text-center">
        <Link
          href={`/game/${game.slug}`}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to {game.name} all levels
        </Link>
      </div>
    </article>
  );
}