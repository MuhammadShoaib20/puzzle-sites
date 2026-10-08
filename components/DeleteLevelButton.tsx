'use client';

import { useState, useTransition } from 'react';
import { deleteLevel } from '@/lib/actions/levels';

type Props = { levelId: string; gameId: string; levelNumber: number };

export default function DeleteLevelButton({ levelId, gameId, levelNumber }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex gap-1">
        <button
          type="button"
          onClick={() => {
            startTransition(async () => {
              const res = await deleteLevel(levelId, gameId);
              if (res?.error) alert(res.error);
            });
          }}
          disabled={isPending}
          className="act act-del solid"
        >
          {isPending ? '…' : 'Yes'}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="act act-ghost">
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="act act-del"
      title={`Delete Level ${levelNumber}`}
    >
      Delete
    </button>
  );
}
