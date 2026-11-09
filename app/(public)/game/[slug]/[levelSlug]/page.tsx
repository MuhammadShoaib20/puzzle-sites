import Link from 'next/link';
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
  generateLevelArticleSchema,
  htmlToPlainText,
} from '@/lib/schema';
import AdSlot from '@/components/AdSlot';
import ClickableWalkthrough from '@/components/ClickableWalkthrough';
import ViewTracker from '@/components/ViewTracker';
import Breadcrumb from '@/components/Breadcrumb';
import PopularLevels from '@/components/PopularLevels';
import JsonLd from '@/components/JsonLd';
import LazyYouTube from '@/components/LazyYouTube';
import { sanitize } from '@/lib/sanitize';
import { canonicalUrl } from '@/lib/seo';

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

function trimTitleAtWordBoundary(title: string, maxLength = 59): string {
  const trimmedTitle = title.trim();
  if (trimmedTitle.length <= maxLength) return trimmedTitle;

  const lastSpace = trimmedTitle.lastIndexOf(' ', maxLength);
  if (lastSpace > 0) {
    return trimmedTitle.slice(0, lastSpace).replace(/[\s&|–—-]+$/, '');
  }

  return trimmedTitle.slice(0, maxLength);
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function formatInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong>$1$2</strong>')
    .replace(/\*(.+?)\*|_(.+?)_/g, '<em>$1$2</em>');
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(`<p>${paragraph.map(formatInlineMarkdown).join(' ')}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listType) {
      blocks.push(`<${listType}>${listItems.join('')}</${listType}>`);
      listType = null;
      listItems = [];
    }
  };

  for (const line of lines) {
    const unorderedItem = line.match(/^\s*[-*+]\s+(.+)$/);
    const orderedItem = line.match(/^\s*\d+[.)]\s+(.+)$/);
    const item = unorderedItem || orderedItem;

    if (item) {
      flushParagraph();
      const nextListType = unorderedItem ? 'ul' : 'ol';
      if (listType !== nextListType) flushList();
      listType = nextListType;
      listItems.push(`<li>${formatInlineMarkdown(item[1])}</li>`);
      continue;
    }

    flushList();
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = Math.min(6, heading[1].length + 1);
      blocks.push(`<h${level}>${formatInlineMarkdown(heading[2])}</h${level}>`);
    } else if (line.trim()) {
      paragraph.push(line.trim());
    } else {
      flushParagraph();
    }
  }

  flushParagraph();
  flushList();
  return blocks.join('');
}

function formatRichContent(content: string): string {
  const hasHtml = /<\/?[a-z][^>]*>/i.test(content);
  const safeHtml = sanitize(hasHtml ? content : markdownToHtml(content));
  return safeHtml
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith('<')) return part;
      const withBold = part.replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong>$1$2</strong>');
      return withBold.replace(
        /\[(?:(\d+):)?(\d{1,2}):([0-5]\d)\]/g,
        (_match, hours: string | undefined, minutes: string, seconds: string) => {
          const totalSeconds =
            (Number(hours || 0) * 3600) + Number(minutes) * 60 + Number(seconds);
          const label = `${hours ? `${hours}:` : ''}${minutes}:${seconds}`;
          return `<a href="#level-video-player" class="video-timestamp" data-video-time="${totalSeconds}">▶ ${label}</a>`;
        }
      );
    })
    .join('');
}

function contentToPlainText(content: string): string {
  return htmlToPlainText(content)
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, '')
    .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '$1$2')
    .replace(/[*_`]/g, '')
    .trim();
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
    level.meta_title || level.title?.trim() || `${game.name} Level ${level.level_number}`,
    59 - titleSuffix.length
  );
  const title = `${titlePrefix}${titleSuffix}`;
  const description =
    contentToPlainText(level.meta_description || '') ||
    contentToPlainText(level.description || '') ||
    contentToPlainText(level.walkthrough || '') ||
    undefined;

  return {
    title: { absolute: title },
    ...(description ? { description } : {}),
    alternates: {
      canonical: canonicalUrl(`/game/${game.slug}/level-${level.level_number}`),
      languages: {
        en: canonicalUrl(`/game/${game.slug}/level-${level.level_number}`),
      },
    },
    openGraph: {
      title,
      ...(description ? { description } : {}),
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
  const popularLevels = [...allLevels]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
  const canonicalLevelUrl = `${siteUrl}/game/${game.slug}/level-${level.level_number}`;
  const quickSolution = level.description?.trim();
  const walkthrough = level.walkthrough?.trim();
  const tip = level.tips?.trim();
  const contentDescription =
    contentToPlainText(quickSolution || '') ||
    contentToPlainText(walkthrough || '') ||
    contentToPlainText(tip || '');

  const videoSchema = generateVideoObjectSchema({
    name: `${game.name} Level ${level.level_number} Walkthrough`,
    description: contentDescription,
    youtubeUrl: level.youtube_url,
    uploadDate: level.created_at,
  });
  const articleSchema = generateLevelArticleSchema({
    headline: level.title?.trim() || `${game.name} Level ${level.level_number}`,
    description: contentDescription,
    canonicalUrl: canonicalLevelUrl,
    publishedDate: level.created_at,
    modifiedDate: level.updated_at || level.created_at,
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
    walkthrough,
  });

  return (
    <div className="animate-fade-in-up level-page">
      <ViewTracker type="level" id={level.id} />
      <JsonLd data={articleSchema} />
      <JsonLd data={videoSchema} />
      <JsonLd data={breadcrumbSchema} />
      {howToSchema && <JsonLd data={howToSchema} />}

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
              <h1 className="page-title mb-2">
                {level.title?.trim() || `${game.name} Level ${level.level_number}`}
              </h1>
            </header>

          {quickSolution && (
            <section className="card level-summary level-content-card mb-5 sm:mb-6 p-4 sm:p-6" aria-labelledby="quick-solution-heading">
              <h2 id="quick-solution-heading" className="level-content-heading mb-2 font-bold">
                Quick Solution (TL;DR)
              </h2>
              <div
                className="prose level-content-body max-w-none text-sm sm:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatRichContent(quickSolution) }}
              />
            </section>
          )}

          <div className="video-frame mb-6">
            <LazyYouTube
              playerId="level-video-player"
              videoId={level.youtube_id}
              title={`${game.name} Level ${level.level_number}`}
            />
          </div>

          {walkthrough && (
            <section className="section level-text-section level-content-card mb-5 sm:mb-6 p-4 sm:p-6">
              <h2 className="section-title level-content-heading mb-3">
                {game.name} Level {level.level_number} Video Walkthrough
              </h2>
              <ClickableWalkthrough
                html={formatRichContent(walkthrough)}
                videoId={level.youtube_id}
              />
            </section>
          )}

          {tip && (
            <section className="tip-box level-content-card mb-5 sm:mb-6 p-4 sm:p-6">
              <h2 className="level-content-heading">Level {level.level_number} Pro Tip / Common Mistake</h2>
              <div
                className="prose level-content-body max-w-none text-sm sm:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatRichContent(tip) }}
              />
            </section>
          )}

          {(prevLevel || nextLevel) && (
            <nav
              className="pager level-page-pager pt-6"
              style={{ borderTop: '1px solid var(--line)' }}
              aria-label="Level navigation"
            >
              {prevLevel && (
                <Link
                  href={`/game/${game.slug}/level-${prevLevel.level_number}`}
                  title={`Go to ${game.name} Level ${prevLevel.level_number} Walkthrough`}
                  className="card card-hover pager-item"
                >
                  <small>← Previous Level</small>
                  <strong>Level {prevLevel.level_number}</strong>
                </Link>
              )}
              {nextLevel && (
                <Link
                  href={`/game/${game.slug}/level-${nextLevel.level_number}`}
                  title={`Go to ${game.name} Level ${nextLevel.level_number} Walkthrough`}
                  className="card card-hover pager-item next"
                >
                  <small>Next Level →</small>
                  <strong>Level {nextLevel.level_number}</strong>
                </Link>
              )}
            </nav>
          )}

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
            <Link
              href={`/game/${game.slug}`}
              className="btn btn-primary btn-block"
            >
              {game.name} Game Guide
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
