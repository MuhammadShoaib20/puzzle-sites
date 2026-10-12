'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { deleteGame, getGameLevelCount } from '@/lib/actions/games';
import { useToast } from './Toast';

type Props = { id: string; name: string };

export default function DeleteGameButton({ id, name }: Props) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [levelCount, setLevelCount] = useState<number | null>(null);

  const handleDeleteClick = useCallback(async () => {
    // Check if game has levels via server action
    const result = await getGameLevelCount(id);
    if (result.success && result.count !== undefined) {
      setLevelCount(result.count);
      setConfirming(true);
    } else if (result.error) {
      toastError(result.error);
    }
  }, [id, toastError]);

  if (confirming) {
    const message = levelCount && levelCount > 0
      ? `This game has ${levelCount} level${levelCount > 1 ? 's' : ''}. Delete all?`
      : `Delete "${name}"?`;

    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-red-600 font-medium mr-2">{message}</span>
        <button
          type="button"
          onClick={() => {
            startTransition(async () => {
              const res = await deleteGame(id);
              if (res?.success) {
                success('Game deleted successfully!');
                router.refresh();
              } else if (res?.error) {
                toastError(res.error);
              }
              setConfirming(false);
              setLevelCount(null);
            });
          }}
          disabled={isPending}
          className="act act-del solid"
        >
          {isPending ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setLevelCount(null);
          }}
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
      onClick={handleDeleteClick}
      className="act act-del"
      title={`Delete ${name}`}
    >
      Delete
    </button>
  );
}
