import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getGameBySlug,
  getPublishedLevelSummariesByGame,
  getBlogsByGame,
  getSettings,
  getAllGameSlugs,
  getRelatedGames,
} from '@/lib/db';
import { extractYoutubeId } from '@/lib/utils';
import {
  generateVideoGameSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
} from '@/lib/schema';
import AdSlot from '@/components/AdSlot';
import ViewTracker from '@/components/ViewTracker';
import Breadcrumb from '@/components/Breadcrumb';
import BlogCard from '@/components/BlogCard';
import LevelSearchGrid, { LevelRangePagination } from '@/components/LevelSearchGrid';
import ScrollToLevelsButton from '@/components/ScrollToLevelsButton';
import PopularLevels from '@/components/PopularLevels';
import JsonLd from '@/components/JsonLd';
import LazyYouTube from '@/components/LazyYouTube';
import { sanitize } from '@/lib/sanitize';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllGameSlugs();
  return slugs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return {};

  return {
    title: game.meta_title || `${game.name} — All Levels Walkthrough & Guide`,
    description:
      game.meta_description ||
      game.short_description ||
      `Complete ${game.name} walkthrough with video guides for all levels.`,
    keywords: game.keywords,
    alternates: { canonical: `/game/${game.slug}` },
    openGraph: {
      title: game.meta_title || game.name,
      description: game.meta_description || game.short_description || '',
      images: game.cover_image ? [game.cover_image] : [],
      type: 'article',
    },
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const [levels, blogs, settings, relatedGames] = await Promise.all([
    getPublishedLevelSummariesByGame(game.id),
    getBlogsByGame(game.id),
    getSettings(),
    getRelatedGames(game.id, 4),
  ]);

  const links = Array.isArray(game.custom_buttons) ? game.custom_buttons : [];
  const trailerId = game.youtube_trailer_url
    ? extractYoutubeId(game.youtube_trailer_url)
    : '';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com').replace(/\/$/, '');
  const popularLevels = [...levels]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const videoGameSchema = generateVideoGameSchema({
    name: game.name,
    description: game.short_description,
    image: game.cover_image,
    operatingSystem: game.operating_system,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { position: 1, name: 'Home', item: siteUrl },
    { position: 2, name: game.name, item: `${siteUrl}/game/${game.slug}` },
  ]);

  const validFaqs = (game.faq || []).filter(
    (f) => f && typeof f.q === 'string' && typeof f.a === 'string' && f.q.trim() && f.a.trim()
  );
  const faqSchema = validFaqs.length > 0 ? generateFAQSchema(validFaqs) : null;
  const organizationSchema = generateOrganizationSchema();

  return (
    <div className="animate-fade-in-up">
      <ViewTracker type="game" id={game.id} />
      <JsonLd data={videoGameSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={organizationSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <div className="container-page pt-5">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: game.name }]} />
      </div>

      <div className="container-page pt-6 pb-8 layout-2col">
        <main className="min-w-0">
          <h1 className="page-title mb-4">{game.name} — All Levels Walkthrough</h1>

          <LevelRangePagination levels={levels} />

          {game.short_description && (
            <p
              className="text-[16px] md:text-[17px] mb-6 leading-relaxed"
              style={{ color: 'var(--ink-soft)' }}
            >
              {game.short_description}
            </p>
          )}

          {game.cover_image && (
            <div className="cover-frame mb-6">
              <Image
                src={game.cover_image}
                alt={`${game.name} cover`}
                fill
                priority
                fetchPriority="high"
                quality={85}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 900px"
              />
            </div>
          )}

          {trailerId && (
            <div className="video-frame mb-6">
              <LazyYouTube videoId={trailerId} title={`${game.name} trailer`} />
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-10">
            <ScrollToLevelsButton />
            {game.youtube_channel_url && (
              <a
                href={game.youtube_channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-youtube"
              >
                ▶ Subscribe
              </a>
            )}
            {links.map((link, index) => (
              <a
                key={`${link.url}-${index}`}
                href={link.url}
                target={link.newTab !== false ? '_blank' : '_self'}
                rel={link.newTab !== false ? 'noopener noreferrer' : undefined}
                className="btn btn-secondary"
              >
                {link.label}
              </a>
            ))}
          </div>

          {game.full_description && (
            <section className="section">
              <h2 className="section-title mb-4">About {game.name}</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitize(game.full_description) }}
              />
            </section>
          )}

          {game.walkthrough_intro && (
            <section className="section">
              <h2 className="section-title mb-4">Walkthrough guide</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitize(game.walkthrough_intro) }}
              />
            </section>
          )}

          {settings?.adsense_in_article && (
            <AdSlot code={settings.adsense_in_article} label="In article" variant="banner" />
          )}

          <LevelSearchGrid gameSlug={game.slug} levels={levels} />

          {blogs.length > 0 && (
            <section className="section" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px 200px' }}>
              <h2 className="section-title mb-5">Guides &amp; tips for {game.name}</h2>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {blogs.map((blog, index) => (
                  <BlogCard key={blog.id} blog={blog} preload={index < 2} />
                ))}
              </div>
            </section>
          )}

          {game.faq && game.faq.length > 0 && (
            <section className="section" style={{ marginBottom: 0 }}>
              <h2 className="section-title mb-5">Frequently asked questions</h2>
              <div className="space-y-3">
                {game.faq.map((faq, index) => (
                  <details key={`${faq.q}-${index}`} className="card faq-item">
                    <summary>
                      <span>{faq.q}</span>
                      <span className="chev" aria-hidden="true">▾</span>
                    </summary>
                    <p>{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="sidebar">
          {settings?.adsense_sidebar && (
            <div className="hidden lg:block">
              <AdSlot code={settings.adsense_sidebar} label="Sidebar" variant="square" />
            </div>
          )}

          <PopularLevels gameSlug={game.slug} levels={popularLevels} />

          {relatedGames.length > 0 && (
            <div className="card p-4 sm:p-5">
              <h3 className="text-[14px] sm:text-[15px] font-bold mb-3 sm:mb-4">Related games</h3>
              <div className="flex flex-col gap-2">
                {relatedGames.map((relatedGame) => (
                  <Link
                    key={relatedGame.id}
                    href={`/game/${relatedGame.slug}`}
                    prefetch={false}
                    className="flex items-center gap-2.5 p-2 rounded-xl transition-colors hover:bg-(--primary-soft) group"
                  >
                    <span
                      className="rounded-xl grid place-items-center shrink-0 text-xs font-bold text-white"
                      style={{
                        width: 'clamp(32px, 4vw, 36px)',
                        height: 'clamp(32px, 4vw, 36px)',
                        background: 'linear-gradient(180deg, #075985, #0369A1)',
                        fontFamily: 'var(--font-display), sans-serif',
                      }}
                    >
                      {relatedGame.total_levels || 0}
                    </span>
                    <span
                      className="text-[13px] sm:text-[13.5px] font-semibold line-clamp-1 transition-colors group-hover:text-(--primary-dark)"
                      style={{ color: 'var(--ink)' }}
                    >
                      {relatedGame.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {settings?.adsense_footer && (
            <div className="hidden lg:block">
              <AdSlot code={settings.adsense_footer} label="Sidebar footer" variant="skyscraper" />
            </div>
          )}

          <Link href="/blog" className="btn btn-secondary btn-block">
            More guides
          </Link>
        </aside>
      </div>
    </div>
  );
}
