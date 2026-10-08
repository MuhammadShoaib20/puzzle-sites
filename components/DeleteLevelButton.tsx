'use client';

import { useState, useTransition } from 'react';
import { deleteLevel } from '@/lib/actions/levels';

type Props = { levelId: string; gameId: string; levelNumber: number };

export default function DeleteLevelButton({ levelId, gameId, levelNumber }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex gap-1 text-xs">
        <button
          onClick={() => {
            startTransition(async () => {
              const res = await deleteLevel(levelId, gameId);
              if (res?.error) alert(res.error);
            });
          }}
          disabled={isPending}
          className="text-red-600 font-semibold hover:underline disabled:opacity-50"
        >
          {isPending ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-gray-500 hover:underline"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-red-600 hover:underline"
      title={`Delete Level ${levelNumber}`}
    >
      Del
    </button>
  );
}