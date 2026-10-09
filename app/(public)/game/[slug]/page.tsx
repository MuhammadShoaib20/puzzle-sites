import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getGameBySlug,
  getLevelsByGame,
  getBlogsByGame,
  getSettings,
} from '@/lib/db';
import { extractYoutubeId } from '@/lib/utils';
import AdSlot from '@/components/AdSlot';
import ViewTracker from '@/components/ViewTracker';
import Breadcrumb from '@/components/Breadcrumb';
import BlogCard from '@/components/BlogCard';
import LevelSearchGrid from '@/components/LevelSearchGrid';
import PopularLevels from '@/components/PopularLevels';
import { sanitize } from '@/lib/sanitize';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

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

  const [levels, blogs, settings] = await Promise.all([
    getLevelsByGame(game.id),
    getBlogsByGame(game.id),
    getSettings(),
  ]);

  const links = Array.isArray(game.custom_buttons) ? game.custom_buttons : [];
  const trailerId = game.youtube_trailer_url
    ? extractYoutubeId(game.youtube_trailer_url)
    : '';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const popularLevels = [...levels]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const videoGameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    description: game.short_description,
    image: game.cover_image,
    applicationCategory: 'GameApplication',
    operatingSystem: game.operating_system || 'Android, iOS',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: game.name,
        item: `${siteUrl}/game/${game.slug}`,
      },
    ],
  };

  const faqSchema =
    game.faq && game.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: game.faq.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        }
      : null;

  return (
    <div className="animate-fade-in-up">
      <ViewTracker type="game" id={game.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoGameSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="container-page pt-5">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: game.name }]} />
      </div>

      <div className="container-page pt-6 pb-8 layout-2col">
        <main className="min-w-0">
          <h1 className="page-title mb-4">{game.name} — All Levels Walkthrough</h1>

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
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            </div>
          )}

          {trailerId && (
            <div className="video-frame mb-6">
              <iframe
                src={`https://www.youtube.com/embed/${trailerId}`}
                title={`${game.name} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}

          {(game.youtube_channel_url || links.length > 0) && (
            <div className="flex flex-wrap gap-4 mb-10">
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
          )}

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
            <section className="section">
              <h2 className="section-title mb-5">Guides &amp; tips for {game.name}</h2>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
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
