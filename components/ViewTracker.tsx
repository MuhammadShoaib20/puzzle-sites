'use client';

import { useEffect } from 'react';

type Props = {
  type: 'game' | 'level' | 'blog';
  id: string;
};

export default function ViewTracker({ type, id }: Props) {
  useEffect(() => {
    const key = `viewed-${type}-${id}`;

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, 'pending');
    } catch {
      // Continue tracking if storage is unavailable.
    }

    fetch('/api/increment-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('View tracking failed');
        try {
          sessionStorage.setItem(key, '1');
        } catch {
          // The view was recorded even if session storage is unavailable.
        }
      })
      .catch(() => {
        try {
          sessionStorage.removeItem(key);
        } catch {
          // Ignore storage errors; analytics should not disrupt the page.
        }
      });
  }, [type, id]);

  return null;
}