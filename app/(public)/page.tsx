import Link from 'next/link';
import { getAllGames, getLatestLevels, getLatestBlogs } from '@/lib/db';
import NavbarSearch from '@/components/NavbarSearch';
import GameCard from '@/components/GameCard';
import BlogCard from '@/components/BlogCard';
import EmptyState from '@/components/EmptyState';
import HomeScrollControls from '@/components/HomeScrollControls';

export const revalidate = 60;

type LevelWithGame = import('@/types').Level & {
  game: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[];
};

const TILES: { n: string; kind: '' | 'solved' | 'stuck' }[] = [
  { n: '1', kind: 'solved' },
  { n: '2', kind: 'solved' },
  { n: '3', kind: 'solved' },
  { n: '4', kind: 'solved' },
  { n: '5', kind: 'solved' },
  { n: '?', kind: 'stuck' },
  { n: '7', kind: '' },
  { n: '8', kind: '' },
];

export default async function HomePage() {
  const [games, levels, blogs] = await Promise.all([
    getAllGames(),
    getLatestLevels(12),
    getLatestBlogs(3),
  ]);

  const totalLevels = games.reduce((sum, g) => sum + (g.total_levels || 0), 0);

  return (
    <div>
      <HomeScrollControls />
      {/* ============= HERO ============= */}
      <section className="hero">
        <div className="hero-dots" />
        <div className="hero-blob b1" />
        <div className="hero-blob b2" />
        <div className="hero-blob b3" />

        <div className="container-narrow relative text-center">
          <h1 className="hero-title animate-fade-in-up">
            Stuck on level 6? Watch how it&apos;s solved.
          </h1>
          <p className="hero-sub animate-fade-in-up" style={{ animationDelay: '90ms' }}>
            Video walkthroughs and step-by-step solutions for every level of your favourite puzzle games.
          </p>

          <div
            className="max-w-xl mx-auto mt-8 animate-fade-in-up"
            style={{ animationDelay: '170ms' }}
          >
            <NavbarSearch big placeholder="Search a game, e.g. Fish Jam" />
          </div>

          <div
            className="hero-actions flex gap-3 sm:gap-4 justify-center flex-wrap mt-8 sm:mt-10 animate-fade-in-up"
            style={{ animationDelay: '260ms' }}
          >
            <Link href="#all-games" className="btn btn-primary btn-lg">
              Browse games
            </Link>
            <Link href="/blog" className="btn btn-secondary btn-lg">
              Read guides
            </Link>
          </div>

          <div className="tile-strip" aria-hidden="true">
            {TILES.map((tile, i) => (
              <span
                key={tile.n + i}
                className={`tile ${tile.kind}`}
                style={{ animationDelay: `${300 + i * 80}ms` }}
              >
                {tile.n}
              </span>
            ))}
          </div>

          <div className="stats-row animate-fade-in-up" style={{ animationDelay: '340ms' }}>
            <div className="stat">
              <b>{games.length}</b>
              <span>Games</span>
            </div>
            <div className="stat">
              <b>{totalLevels}</b>
              <span>Levels</span>
            </div>
            <div className="stat">
              <b>Free</b>
              <span>Video guides</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============= ALL GAMES ============= */}
      <section id="all-games" className="container-page section" style={{ scrollMarginTop: 100 }}>
        <div className="section-head">
          <div>
            <h2 className="section-title">All games</h2>
            <p className="section-sub">
              {games.length} {games.length === 1 ? 'game' : 'games'} with level-by-level guides
            </p>
          </div>
        </div>

        {games.length === 0 ? (
          <EmptyState
            emoji="🎮"
            title="No games added yet"
            text="Add games from the admin panel to see them here."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {games.map((game, idx) => (
              <GameCard key={game.id} game={game} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* ============= LATEST LEVELS ============= */}
      {levels.length > 0 && (
        <section className="container-page section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Latest levels</h2>
              <p className="section-sub">Fresh walkthroughs added recently</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {(levels as LevelWithGame[]).map((level) => {
              const gameData = Array.isArray(level.game) ? level.game[0] : level.game;
              if (!gameData?.slug) return null;
              return (
                <Link
                  key={level.id}
                  href={`/game/${gameData.slug}/level-${level.level_number}`}
                  className="card card-hover level-row"
                >
                  <div className="level-badge">{level.level_number}</div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-bold text-[15px] line-clamp-1"
                      style={{ color: 'var(--ink)' }}
                    >
                      {level.title || `Level ${level.level_number}`}
                    </h3>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--muted)' }}>
                      {gameData.name} · {level.views} views
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ============= LATEST BLOGS ============= */}
      {blogs.length > 0 && (
        <section className="container-page section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Latest guides</h2>
              <p className="section-sub">Tips, tricks and walkthrough articles</p>
            </div>
            <Link href="/blog" className="link-arrow">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      {/* ============= CTA ============= */}
      <section className="container-page section" style={{ marginBottom: 0 }}>
        <div className="cta-band">
          <h2>Can&apos;t find your game?</h2>
          <p>Tell us which puzzle game you&apos;re stuck on and we&apos;ll add its walkthrough.</p>
          <Link href="/contact" className="btn btn-accent btn-lg btn-stack">
            Request a game
          </Link>
        </div>
      </section>
    </div>
  );
}
