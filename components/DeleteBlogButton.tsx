'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBlog } from '@/lib/actions/blogs';
import { useToast } from './Toast';

type Props = { id: string; title: string };

export default function DeleteBlogButton({ id, title }: Props) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = useCallback(() => {
    startTransition(async () => {
      const res = await deleteBlog(id);
      if (res?.success) {
        success('Blog deleted successfully!');
        router.refresh();
      } else if (res?.error) {
        toastError(res.error);
      }
      setConfirming(false);
    });
  }, [id, router, success, toastError]);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-red-600 font-medium mr-2">Delete "{title}"?</span>
        <button
          type="button"
          onClick={handleConfirm}
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
