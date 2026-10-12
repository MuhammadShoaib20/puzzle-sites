'use client';

import { useState, useTransition } from 'react';
import { deletePage } from '@/lib/actions/pages';

type Props = { id: string; title: string };

export default function DeletePageButton({ id, title }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            startTransition(async () => {
              const result = await deletePage(id);
              if (result?.error) alert(result.error);
            });
          }}
          disabled={isPending}
          className="act act-del solid"
        >
          {isPending ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="act act-ghost"
        >
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
      title={`Delete ${title}`}
    >
      Delete
    </button>
  );
}
