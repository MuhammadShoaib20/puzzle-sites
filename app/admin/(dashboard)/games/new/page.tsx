import { createGame } from '@/lib/actions/games';
import GameForm from '@/components/GameForm';

export const dynamic = 'force-dynamic';

export default function NewGamePage() {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Add New Game</h1>
      <p className="text-gray-600 mb-8">
        Fill in the details below to add a new game.
      </p>

      <GameForm action={createGame} submitLabel="Create Game" />
    </div>
  );
}