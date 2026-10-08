import Link from 'next/link';
import type { Metadata } from 'next';
import { searchGames } from '@/lib/db';

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
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">🔍 Search</h1>

      <form action="/search" method="get" className="mb-8">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search games..."
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      {query && (
        <p className="text-gray-600 mb-6">
          {games.length} result{games.length === 1 ? '' : 's'} for{' '}
          <span className="font-semibold">&quot;{query}&quot;</span>
        </p>
      )}

      {games.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.slug}`}
              className="border rounded-xl p-4 hover:shadow-lg transition"
            >
              <h3 className="font-semibold">{game.name}</h3>
              {game.short_description && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {game.short_description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {query && games.length === 0 && (
        <div className="border-2 border-dashed rounded-xl p-10 text-center text-gray-500">
          <p className="text-lg mb-2">Koi result nahi mila.</p>
          <p className="text-sm">Try different keywords.</p>
        </div>
      )}

      {!query && (
        <div className="border-2 border-dashed rounded-xl p-10 text-center text-gray-500">
          <p>Type something above to search games.</p>
        </div>
      )}
    </div>
  );
}