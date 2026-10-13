import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getGameBySlug,
  getLevelByNumber,
  getLevelsByGame,
  getSettings,
  getPopularLevelSlugs,
  getRecentLevelSlugs,
} from '@/lib/db';
import {
  generateVideoObjectSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
} from '@/lib/schema';
import AdSlot from '@/components/AdSlot';
import ViewTracker from '@/components/ViewTracker';
import Breadcrumb from '@/components/Breadcrumb';
import PopularLevels from '@/components/PopularLevels';
import JsonLd from '@/components/JsonLd';
import { sanitize } from '@/lib/sanitize';

type Props = { params: Promise<{ slug: string; levelSlug: string }> };

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  const popular = await getPopularLevelSlugs(100);
  const recent = await getRecentLevelSlugs(100);

  const seen = new Set();
  const params = [];

  for (const item of [...popular, ...recent]) {
    const key = `${item.game_slug}-${item.level_number}`;
    if (seen.has(key)) continue;
    seen.add(key);
    params.push({
      slug: item.game_slug,
      levelSlug: `level-${item.level_number}`,
    });
  }

  return params;
}

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

  const title = level.meta_title || `${game.name} Level ${level.level_number} Walkthrough & Solution`;
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

  const currentIndex = allLevels.findIndex((item) => item.level_number === levelNumber);
  const prevLevel = currentIndex > 0 ? allLevels[currentIndex - 1] : null;
  const nextLevel = currentIndex < allLevels.length - 1 ? allLevels[currentIndex + 1] : null;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com').replace(/\/$/, '');
  const startIdx = Math.max(0, currentIndex - 5);
  const endIdx = Math.min(allLevels.length, currentIndex + 15);
  const nearbyLevels = allLevels.slice(startIdx, endIdx);
  const popularLevels = [...allLevels]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const videoSchema = generateVideoObjectSchema({
    name: `${game.name} Level ${level.level_number} Walkthrough`,
    description: level.description || level.title || '',
    youtubeUrl: level.youtube_url,
    uploadDate: level.created_at,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { position: 1, name: 'Home', item: siteUrl },
    { position: 2, name: game.name, item: `${siteUrl}/game/${game.slug}` },
    {
      position: 3,
      name: `Level ${level.level_number}`,
      item: `${siteUrl}/game/${game.slug}/level-${level.level_number}`,
    },
  ]);

  const howToSchema = generateHowToSchema({
    gameName: game.name,
    levelNumber: level.level_number,
    walkthrough: level.walkthrough,
  });

  return (
    <div className="animate-fade-in-up">
      <ViewTracker type="level" id={level.id} />
      <JsonLd data={videoSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={howToSchema} />

      <div className="container-page pt-5">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: game.name, href: `/game/${game.slug}` },
            { label: `Level ${level.level_number}` },
          ]}
        />
      </div>

      <div className="container-page pt-6 pb-8 layout-2col">
        <main className="min-w-0">
          <h1 className="page-title mb-2">
            {game.name} Level {level.level_number} Walkthrough
          </h1>

          <p className="text-[13px] mb-5" style={{ color: 'var(--muted)' }}>
            {level.views} views · {new Date(level.created_at).toLocaleDateString()}
          </p>

          <div className="video-frame mb-6">
            <iframe
              src={`https://www.youtube.com/embed/${level.youtube_id}`}
              title={`${game.name} Level ${level.level_number}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <a
              href={level.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-youtube"
            >
              ▶ {settings?.youtube_button_text || 'Watch on YouTube'}
            </a>
            <Link href={`/game/${game.slug}`} className="btn btn-secondary">
              🎮 All levels
            </Link>
          </div>

          {settings?.adsense_in_article && (
            <AdSlot code={settings.adsense_in_article} label="In article" variant="banner" />
          )}

          {level.description && (
            <section className="section" style={{ marginBottom: '2rem' }}>
              <h2 className="section-title mb-3">Overview</h2>
              <p className="leading-7" style={{ color: 'var(--ink-soft)' }}>
                {level.description}
              </p>
            </section>
          )}

          {level.walkthrough && (
            <section className="section" style={{ marginBottom: '2rem' }}>
              <h2 className="section-title mb-3">Step-by-step walkthrough</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitize(level.walkthrough) }}
              />
            </section>
          )}

          {level.tips && (
            <section className="tip-box mb-8">
              <h3>💡 Pro tip</h3>
              <div
                className="prose max-w-none text-[14.5px]"
                dangerouslySetInnerHTML={{ __html: sanitize(level.tips) }}
              />
            </section>
          )}

          {nearbyLevels.length > 0 && (
            <section className="section" style={{ marginBottom: '2rem' }}>
              <h2 className="section-title mb-4">More levels</h2>
              <div className="level-grid">
                {nearbyLevels.map((item) => (
                  <Link
                    key={item.id}
                    href={`/game/${game.slug}/level-${item.level_number}`}
                    className={`level-tile ${item.level_number === levelNumber ? 'current' : ''}`}
                    aria-current={item.level_number === levelNumber ? 'page' : undefined}
                  >
                    {item.level_number}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <nav className="pager pt-6" style={{ borderTop: '1px solid var(--line)' }} aria-label="Level navigation">
            {prevLevel ? (
              <Link
                href={`/game/${game.slug}/level-${prevLevel.level_number}`}
                className="card card-hover pager-item"
              >
                <small>← Previous</small>
                <strong>Level {prevLevel.level_number}</strong>
              </Link>
            ) : (
              <div />
            )}
            {nextLevel ? (
              <Link
                href={`/game/${game.slug}/level-${nextLevel.level_number}`}
                className="card card-hover pager-item next"
              >
                <small>Next →</small>
                <strong>Level {nextLevel.level_number}</strong>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </main>

        <aside className="sidebar">
          {settings?.adsense_sidebar && (
            <div className="hidden lg:block">
              <AdSlot code={settings.adsense_sidebar} label="Sidebar" variant="square" />
            </div>
          )}

          <PopularLevels gameSlug={game.slug} levels={popularLevels} />

          {settings?.adsense_footer && (
            <div className="hidden lg:block">
              <AdSlot code={settings.adsense_footer} label="Sidebar footer" variant="skyscraper" />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
