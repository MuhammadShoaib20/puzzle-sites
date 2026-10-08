import type { Metadata } from 'next';
import { searchGames } from '@/lib/db';
import GameCard from '@/components/GameCard';
import EmptyState from '@/components/EmptyState';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search puzzle games and walkthroughs.',
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || '';
  const games = query ? await searchGames(query) : [];

  return (
    <div className="container-page py-10 md:py-16 animate-fade-in-up">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="page-title">Search</h1>
        <p className="page-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Find games and walkthroughs.
        </p>

        <form action="/search" method="get" className="search-wrap search-big mt-7">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search games…"
            aria-label="Search games"
            autoFocus
            className="search-input"
          />
          <button type="submit" className="btn btn-primary btn-sm search-submit">
            Search
          </button>
        </form>
      </div>

      {query && (
        <p className="text-center mb-6" style={{ color: 'var(--muted)' }}>
          {games.length} result{games.length === 1 ? '' : 's'} for{' '}
          <span className="font-bold" style={{ color: 'var(--ink)' }}>
            &quot;{query}&quot;
          </span>
        </p>
      )}

      {games.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {games.map((game, idx) => (
            <GameCard key={game.id} game={game} index={idx} />
          ))}
        </div>
      )}

      {query && games.length === 0 && (
        <div className="max-w-lg mx-auto">
          <EmptyState emoji="🔍" title="No results found" text="Try a different game name." />
        </div>
      )}

      {!query && (
        <div className="max-w-lg mx-auto">
          <EmptyState emoji="🎮" text="Type a game name above to search." />
        </div>
      )}
    </div>
  );
}
