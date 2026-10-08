'use client';

import { useState, useTransition } from 'react';
import { bulkGenerateLevels } from '@/lib/actions/levels';

export default function BulkGenerateForm({ gameId }: { gameId: string }) {
  const [from, setFrom] = useState('1');
  const [to, setTo] = useState('50');
  const [defaultUrl, setDefaultUrl] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const fd = new FormData();
    fd.set('from', from);
    fd.set('to', to);
    fd.set('default_youtube_url', defaultUrl);

    startTransition(async () => {
      const res = await bulkGenerateLevels(gameId, fd);
      if (res?.error) setError(res.error);
    });
  }

  const field = 'w-full px-3 py-2.5 border rounded-xl outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-[110px_110px_1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">From</label>
          <input type="number" value={from} onChange={(e) => setFrom(e.target.value)} min="1" required className={field} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">To</label>
          <input type="number" value={to} onChange={(e) => setTo(e.target.value)} min="1" required className={field} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-semibold mb-1">Default YouTube URL (optional)</label>
          <input
            type="url"
            value={defaultUrl}
            onChange={(e) => setDefaultUrl(e.target.value)}
            placeholder="https://youtu.be/..."
            className={field}
          />
        </div>
        <button type="submit" disabled={isPending} className="btn btn-primary btn-sm col-span-2 sm:col-span-1">
          {isPending ? 'Generating…' : '⚡ Generate'}
        </button>
      </div>

      {error && (
        <p className="text-sm px-3 py-2 rounded-xl" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </p>
      )}

      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        Example: From 1 To 50 creates 50 blank levels.
      </p>
    </form>
  );
}
