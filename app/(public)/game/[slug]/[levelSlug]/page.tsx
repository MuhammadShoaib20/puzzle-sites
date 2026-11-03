import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getGameBySlug,
  getLevelByNumber,
  getPublishedLevelSummariesByGame,
  getSettings,
  getPopularLevelSlugs,
  getRecentLevelSlugs,
} from '@/lib/db';
import {
  generateVideoObjectSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
  generateFAQSchema,
  generateLevelArticleSchema,
  htmlToPlainText,
  LEVEL_AUTHOR_NAME,
} from '@/lib/schema';
import AdSlot from '@/components/AdSlot';
import ViewTracker from '@/components/ViewTracker';
import Breadcrumb from '@/components/Breadcrumb';
import PopularLevels from '@/components/PopularLevels';
import JsonLd from '@/components/JsonLd';
import LazyYouTube from '@/components/LazyYouTube';
import { sanitize } from '@/lib/sanitize';
import { canonicalUrl } from '@/lib/seo';

type Props = { params: Promise<{ slug: string; levelSlug: string }> };

export const revalidate = false;
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

function trimTitleAtWordBoundary(title: string, maxLength = 59): string {
  const trimmedTitle = title.trim();
  if (trimmedTitle.length <= maxLength) return trimmedTitle;

  const lastSpace = trimmedTitle.lastIndexOf(' ', maxLength);
  if (lastSpace > 0) {
    return trimmedTitle.slice(0, lastSpace).replace(/[\s&|–—-]+$/, '');
  }

  return 'Level Walkthrough';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, levelSlug } = await params;
  const levelNumber = parseLevelNumber(levelSlug);
  if (isNaN(levelNumber)) return {};

  const game = await getGameBySlug(slug);
  if (!game) return {};

  const level = await getLevelByNumber(game.id, levelNumber);
  if (!level) return {};

  const titleSuffix = ' | Puzzle Walkthroughs';
  const titlePrefix = trimTitleAtWordBoundary(
    level.meta_title || `${game.name} Level ${level.level_number} Walkthrough & Solution`,
    59 - titleSuffix.length
  );
  const title = `${titlePrefix}${titleSuffix}`;
  const developer =
    typeof game === 'object' && game && 'developer' in game
      ? String((game as Record<string, unknown>).developer ?? '').trim()
      : '';
  const description =
    level.meta_description ||
    `Stuck on ${game.name} Level ${level.level_number}? Watch our full video walkthrough and get pro tips to beat this ${developer || 'game'} level fast. Complete solution inside!`;

  return {
    title: { absolute: title },
    description,
    authors: [{ name: LEVEL_AUTHOR_NAME }],
    alternates: {
      canonical: canonicalUrl(`/game/${game.slug}/level-${level.level_number}`),
      languages: {
        en: canonicalUrl(`/game/${game.slug}/level-${level.level_number}`),
      },
    },
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
    getPublishedLevelSummariesByGame(game.id),
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
  const author = LEVEL_AUTHOR_NAME;
  const customButtons = Array.isArray(game.custom_buttons) ? game.custom_buttons : [];
  const canonicalLevelUrl = `${siteUrl}/game/${game.slug}/level-${level.level_number}`;
  const walkthroughText = htmlToPlainText(level.walkthrough || '');
  const walkthroughItems = walkthroughText
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const summaryDetail =
    htmlToPlainText(level.tips || '') ||
    walkthroughItems[0] ||
    'Review the level-specific strategy and walkthrough below before making your moves.';
  const faqItems = [
    {
      q: `How to beat ${game.name} Level ${level.level_number}?`,
      a:
        level.description ||
        walkthroughText.split('\n')[0] ||
        `Watch the video walkthrough below for the solution to ${game.name} Level ${level.level_number}.`,
    },
    {
      q: `What is the best strategy for ${game.name} Level ${level.level_number}?`,
      a:
        htmlToPlainText(level.tips || '') ||
        `Follow the walkthrough steps in order and use the video guide to check each move.`,
    },
    {
      q: `Can I beat ${game.name} Level ${level.level_number} without boosters?`,
      a: 'Yes, with patience and the right strategy, it is possible. Watch the video guide below and follow the steps carefully.',
    },
  ];

  const videoSchema = generateVideoObjectSchema({
    name: `${game.name} Level ${level.level_number} Walkthrough`,
    description: level.description || level.title || '',
    youtubeUrl: level.youtube_url,
    uploadDate: level.created_at,
  });
  const articleSchema = generateLevelArticleSchema({
    headline: `${game.name} Level ${level.level_number} Walkthrough`,
    description: level.meta_description || level.description || level.title || '',
    canonicalUrl: canonicalLevelUrl,
    publishedDate: level.created_at,
    modifiedDate: level.updated_at || level.created_at,
  });
  const faqSchema = generateFAQSchema(faqItems);

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
    walkthrough: level.walkthrough || level.description,
  });

  return (
    <div className="animate-fade-in-up">
      <ViewTracker type="level" id={level.id} />
      <JsonLd data={articleSchema} />
      <JsonLd data={videoSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={howToSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

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
          <article>
            <header className="mb-5">
              <div className="author-info mb-2 text-[13px]" style={{ color: 'var(--muted)' }}>
                <time dateTime={level.created_at}>
                  {new Date(level.created_at).toLocaleDateString()}
                </time>
                {' · '}By {author}
              </div>
              <h1 className="page-title mb-2">
                How to beat {game.name} Level {level.level_number}?
              </h1>
              {level.title && (
                <p className="mb-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
                  {level.title}
                </p>
              )}
            </header>

          <div className="video-frame mb-6">
            <LazyYouTube
              videoId={level.youtube_id}
              title={`${game.name} Level ${level.level_number}`}
            />
          </div>

          <section className="card mb-6 p-4 sm:p-5" aria-labelledby="level-summary-heading">
            <h2 id="level-summary-heading" className="mb-2 font-bold">
              TL;DR (Summary)
            </h2>
            <p className="text-sm leading-6" style={{ color: 'var(--ink-soft)' }}>
              Summary: Beat {game.name} Level {level.level_number} by following the
              level-specific walkthrough. {summaryDetail}
            </p>
          </section>

          <p className="mb-6 text-sm leading-6" style={{ color: 'var(--ink-soft)' }}>
            Use a careful approach on this level. Keeping the center columns clear may preserve
            room for later moves; follow the walkthrough sequence and adapt it to the board.
          </p>

          {level.screenshots && level.screenshots.length > 0 && (
            <section className="step-screenshots mb-8">
              <h2 className="section-title step-screenshots-heading mb-6">
                What does each step look like?
              </h2>
              <div className="step-screenshot-list">
                {level.screenshots.map((screenshot, index) => {
                  const overview = screenshot.overview?.trim() || '';
                  const altText = `${game.name} Level ${level.level_number} Step ${index + 1}`;

                  return (
                    <article
                      key={`${screenshot.url}-${index}`}
                      className="step-screenshot-card"
                    >
                      <div className="step-screenshot-media">
                        <Image
                          src={screenshot.url}
                          alt={altText}
                          title={altText}
                          width={1200}
                          height={800}
                          sizes="(max-width: 768px) 100vw, 800px"
                          loading="lazy"
                          className="step-screenshot-image"
                        />
                        <span className="step-screenshot-badge">Step {index + 1}</span>
                      </div>
                      <div className="step-screenshot-copy">
                        <h3 className="step-screenshot-title">What happens in this step?</h3>
                        <p className="step-screenshot-overview">
                          {overview}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

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
            {customButtons.map((button, index) => (
              <a
                key={`${button.url}-${index}`}
                href={button.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {button.label}
              </a>
            ))}
          </div>

          {settings?.adsense_in_article && (
            <AdSlot code={settings.adsense_in_article} label="In article" variant="banner" />
          )}

          {level.description && (
            <section className="section" style={{ marginBottom: '2rem' }}>
              <h2 className="section-title mb-3">What is the strategy for this level?</h2>
              <p className="leading-7" style={{ color: 'var(--ink-soft)' }}>
                {level.description}
              </p>
            </section>
          )}

          {level.walkthrough && (
            <section className="section" style={{ marginBottom: '2rem' }}>
              <h2 className="section-title mb-3">How do you solve this level?</h2>
              {walkthroughItems.length > 0 ? (
                <ol className="list-decimal space-y-2 pl-6 leading-7">
                  {walkthroughItems.map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                  ))}
                </ol>
              ) : (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitize(level.walkthrough) }}
                />
              )}
            </section>
          )}

          {level.tips && (
            <section className="tip-box mb-8">
              <h3>💡 What is the key tip for this level?</h3>
              <div
                className="prose max-w-none text-[14.5px]"
                dangerouslySetInnerHTML={{ __html: sanitize(level.tips) }}
              />
            </section>
          )}

          <section className="section mb-8" aria-labelledby="level-faq-heading">
            <h2 id="level-faq-heading" className="section-title mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqItems.map((faq) => (
                <details key={faq.q} className="card faq-item">
                  <summary className="cursor-pointer font-semibold">{faq.q}</summary>
                  <p className="mt-3 leading-7" style={{ color: 'var(--ink-soft)' }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="card mb-8 p-5" aria-labelledby="author-heading">
            <h2 id="author-heading" className="mb-2 font-bold">
              About the Author
            </h2>
            <p className="leading-7" style={{ color: 'var(--ink-soft)' }}>
              Written by the MS Digital System Team. We are a dedicated group of puzzle enthusiasts
              who create clear, practical walkthroughs to help players solve tricky levels.
            </p>
          </section>

          {nearbyLevels.length > 0 && (
            <section className="section" style={{ marginBottom: '2rem' }}>
              <h2 className="section-title mb-4">Which level should you try next?</h2>
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

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
            <Link
              href={`/game/${game.slug}`}
              className="btn btn-secondary btn-block"
            >
              🎮 Complete {game.name} guide
            </Link>
          </div>
          </article>
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
