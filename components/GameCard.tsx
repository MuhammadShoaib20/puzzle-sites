import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '@/types';

type Props = { game: Game; index?: number };

export default function GameCard({ game, index = 0 }: Props) {
  return (
    <Link
      href={`/game/${game.slug}`}
      className="card card-hover game-card animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div className="game-thumb">
        {game.cover_image ? (
          <Image
            src={game.cover_image}
            alt={game.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <span className="text-5xl" aria-hidden="true">🎮</span>
        )}
        <span className="badge badge-white game-badge">{game.total_levels || 0} levels</span>
      </div>
      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="game-title">{game.name}</h3>
        {game.short_description && <p className="game-desc">{game.short_description}</p>}
      </div>
    </Link>
  );
}
