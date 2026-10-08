'use client';

import { useState, useTransition } from 'react';
import { deleteGame } from '@/lib/actions/games';

type Props = { id: string; name: string };

export default function DeleteGameButton({ id, name }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            startTransition(async () => {
              const res = await deleteGame(id);
              if (res?.error) alert(res.error);
            });
          }}
          disabled={isPending}
          className="act act-del solid"
        >
          {isPending ? 'Deleting…' : 'Confirm'}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="act act-ghost">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="act act-del"
      title={`Delete ${name}`}
    >
      Delete
    </button>
  );
}
