'use client';

import { useState, useTransition } from 'react';
import { deleteGame } from '@/lib/actions/games';

type Props = { id: string; name: string };

export default function DeleteGameButton({ id, name }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          onClick={() => {
            startTransition(async () => {
              const res = await deleteGame(id);
              if (res?.error) alert(res.error);
            });
          }}
          disabled={isPending}
          className="text-sm text-red-600 font-semibold hover:underline disabled:opacity-50"
        >
          {isPending ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-600 hover:underline"
      title={`Delete ${name}`}
    >
      Delete
    </button>
  );
}