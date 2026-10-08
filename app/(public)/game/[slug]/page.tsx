import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getGameBySlug,
  getLevelsByGame,
  getBlogsByGame,
  getGameLinks,
} from '@/lib/db';
import { extractYoutubeId, formatDate } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

// ==========================================
// SEO METADATA
// ==========================================
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

// ==========================================
// PAGE
// ==========================================
export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const [levels, blogs, links] = await Promise.all([
    getLevelsByGame(game.id),
    getBlogsByGame(game.id),
    getGameLinks(game.id),
  ]);

  // ============================
  // SCHEMAS (SEO)
  // ============================
  const videoGameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    description: game.short_description,
    image: game.cover_image,
    applicationCategory: 'Game',
    operatingSystem: 'Android, iOS',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: game.name,
        item: `/game/${game.slug}`,
      },
    ],
  };

  const faqSchema =
    game.faq && game.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: game.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  const trailerId = game.youtube_trailer_url
    ? extractYoutubeId(game.youtube_trailer_url)
    : '';

  return (
    <article className="max-w-5xl mx-auto px-4 py-10">
      {/* SEO Schemas */}
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

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{game.name}</span>
      </nav>

      {/* H1 */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {game.name} — All Levels Walkthrough
      </h1>

      {/* Cover Image */}
      {game.cover_image && (
        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6 relative">
          <Image
            src={game.cover_image}
            alt={`${game.name} cover`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
      )}

      {/* Short Description */}
      {game.short_description && (
        <p className="text-lg text-gray-700 mb-6">{game.short_description}</p>
      )}

      {/* YouTube Trailer */}
      {trailerId && (
        <div className="aspect-video rounded-xl overflow-hidden bg-black mb-6">
          <iframe
            src={`https://www.youtube.com/embed/${trailerId}`}
            title={`${game.name} trailer`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      {/* Custom Buttons (admin-controlled) */}
      <div className="flex flex-wrap gap-3 mb-10">
        {game.youtube_channel_url && (
          <a
            href={game.youtube_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            ▶ Subscribe on YouTube
          </a>
        )}
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target={link.new_tab ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* ===================== */}
      {/* ABOUT SECTION */}
      {/* ===================== */}
      {game.full_description && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">About {game.name}</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: game.full_description }}
          />
        </section>
      )}

      {game.walkthrough_intro && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Walkthrough Guide</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: game.walkthrough_intro }}
          />
        </section>
      )}

      {/* ===================== */}
      {/* ALL LEVELS BUTTONS */}
      {/* ===================== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            🎮 All Levels ({levels.length})
          </h2>
        </div>

        {levels.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-10 text-center text-gray-500">
            <p>Abhi koi level add nahi hua.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {levels.map((level) => (
              <Link
                key={level.id}
                href={`/game/${game.slug}/level-${level.level_number}`}
                className="text-center py-3 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-lg font-semibold transition"
              >
                {level.level_number}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===================== */}
      {/* BLOGS SECTION */}
      {/* ===================== */}
      {blogs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            📝 Guides & Tips for {game.name}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="border rounded-xl p-4 hover:shadow-lg transition"
              >
                <h3 className="font-semibold mb-1 line-clamp-2">
                  {blog.title}
                </h3>
                {blog.meta_description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {blog.meta_description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(blog.created_at)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===================== */}
      {/* FAQ SECTION */}
      {/* ===================== */}
      {game.faq && game.faq.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {game.faq.map((f, i) => (
              <details
                key={i}
                className="border rounded-lg p-4 group"
              >
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  <span>{f.q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-gray-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}