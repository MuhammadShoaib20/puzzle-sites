import Link from 'next/link';
import { getAllGames, getLatestLevels, getLatestBlogs } from '@/lib/db';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/schema';
import NavbarSearch from '@/components/NavbarSearch';
import GameCard from '@/components/GameCard';
import BlogCard from '@/components/BlogCard';
import EmptyState from '@/components/EmptyState';
import JsonLd from '@/components/JsonLd';
import type { Level } from '@/types';

export const revalidate = false;

type GameRef = { id: string; name: string; slug: string };

type LevelWithGame = Level & {
  game: GameRef | GameRef[];
};

// Decorative "level board" shown in the hero. Level 6 is the one you're stuck on.
const BOARD: { n: string; kind: '' | 'solved' | 'stuck' }[] = [
  { n: '1', kind: 'solved' },
  { n: '2', kind: 'solved' },
  { n: '3', kind: 'solved' },
  { n: '4', kind: 'solved' },
  { n: '5', kind: 'solved' },
  { n: '?', kind: 'stuck' },
  { n: '7', kind: '' },
  { n: '8', kind: '' },
  { n: '9', kind: '' },
  { n: '10', kind: '' },
  { n: '11', kind: '' },
  { n: '12', kind: '' },
];

function LevelLink({ level }: { level: LevelWithGame }) {
  const gameData = Array.isArray(level.game) ? level.game[0] : level.game;
  if (!gameData?.slug) return null;

  return (
    <Link
      href={`/game/${gameData.slug}/level-${level.level_number}`}
      prefetch={false}
      className="lv-link"
    >
      <span className="lv-num">{level.level_number}</span>
      <span className="lv-text">
        <span className="lv-title">{level.title || `Level ${level.level_number}`}</span>
        <span className="lv-game">{gameData.name}</span>
      </span>
    </Link>
  );
}

export default async function HomePage() {
  const [games, levels, blogs] = await Promise.all([
    getAllGames(),
    getLatestLevels(12),
    getLatestBlogs(3),
  ]);

  const totalLevels = games.reduce((sum, g) => sum + (g.total_levels || 0), 0);

  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <div className="home">
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />

      {/* ============= HERO ============= */}
      <section className="home-hero">
        <div className="container-page home-hero-grid">
          <div className="home-hero-copy">
            <h1 className="home-title">Stuck on level 6? Watch how it&apos;s solved.</h1>
            <p className="home-lead">
              Video walkthroughs and step-by-step solutions for every level of your favourite
              puzzle games.
            </p>

            <div className="home-search">
              <NavbarSearch big placeholder="Search a game, e.g. Fish Jam" />
            </div>

            <div className="home-actions">
              <Link href="#all-games" className="btn btn-primary btn-lg">
                Browse games
              </Link>
              <Link href="/blog" className="btn btn-secondary btn-lg">
                Read guides
              </Link>
            </div>

            <div className="home-stats">
              <div className="home-stat">
                <b>{games.length}</b>
                <span>{games.length === 1 ? 'game' : 'games'}</span>
              </div>
              <div className="home-stat">
                <b>{totalLevels}</b>
                <span>levels</span>
              </div>
              <div className="home-stat">
                <b>Free</b>
                <span>video guides</span>
              </div>
            </div>
          </div>

          <div className="level-board" aria-hidden="true">
            <div className="board-head">
              <span className="board-live" />
              <span>Level 6 solution is ready</span>
            </div>
            <div className="board-grid">
              {BOARD.map((tile, i) => (
                <span
                  key={tile.n}
                  className={`board-tile ${tile.kind}`}
                  style={{ animationDelay: `${120 + i * 55}ms` }}
                >
                  {tile.n}
                </span>
              ))}
            </div>
            <div className="board-foot">
              <span className="board-play" />
              <span>Watch the full video solution</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============= ALL GAMES ============= */}
      <section id="all-games" className="container-page home-section">
        <div className="home-head">
          <div>
            <h2 className="home-h2">All games</h2>
            <p className="home-sub">
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
        <section className="container-page home-section home-lazy">
          <div className="home-head">
            <div>
              <h2 className="home-h2">Latest levels</h2>
              <p className="home-sub">Fresh walkthroughs added recently</p>
            </div>
          </div>

          <div className="lv-grid">
            {(levels as LevelWithGame[]).map((level) => (
              <LevelLink key={level.id} level={level} />
            ))}
          </div>
        </section>
      )}

      {/* ============= LATEST BLOGS ============= */}
      {blogs.length > 0 && (
        <section className="container-page home-section home-lazy">
          <div className="home-head">
            <div>
              <h2 className="home-h2">Latest guides</h2>
              <p className="home-sub">Tips, tricks and walkthrough articles</p>
            </div>
            <Link href="/blog" className="link-arrow">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {blogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} preload={index < 2} />
            ))}
          </div>
        </section>
      )}

      {/* ============= CTA ============= */}
      <section className="container-page home-section home-lazy home-section-last">
        <div className="home-cta">
          <div>
            <h2>Can&apos;t find your game?</h2>
            <p>Tell us which puzzle game you&apos;re stuck on and we&apos;ll add its walkthrough.</p>
          </div>
          <Link href="/contact" className="btn btn-accent btn-lg">
            Request a game
          </Link>
        </div>
      </section>
    </div>
  );
}
