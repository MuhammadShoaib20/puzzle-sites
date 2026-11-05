import type { Metadata } from 'next';
import { getAllGames } from '@/lib/db';
import GameCard from '@/components/GameCard';
import EmptyState from '@/components/EmptyState';
import { canonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'All Puzzle Games — Walkthroughs & Level Guides',
  description: 'Browse every puzzle game we cover — step-by-step level walkthroughs, video solutions and tips.',
  alternates: {
    canonical: canonicalUrl('/games'),
    languages: { en: canonicalUrl('/games') },
  },
};

export const revalidate = 3600;

export default async function GamesPage() {
  const games = await getAllGames();

  return (
    <div className="container-page py-10 md:py-16 animate-fade-in-up game-grid-page games-page">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="page-title">All Games</h1>
        <p className="page-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Every puzzle game we cover — level-by-level walkthroughs, video solutions and pro tips.
        </p>
      </header>

      {games.length === 0 ? (
        <EmptyState
          emoji="🎮"
          title="No games yet"
          text="Add games from the admin panel to see them here."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
