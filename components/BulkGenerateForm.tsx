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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">From</label>
          <input
            type="number"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            min="1"
            required
            className="w-24 px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <input
            type="number"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            min="1"
            required
            className="w-24 px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-64">
          <label className="block text-sm font-medium mb-1">
            Default YouTube URL (optional)
          </label>
          <input
            type="url"
            value={defaultUrl}
            onChange={(e) => setDefaultUrl(e.target.value)}
            placeholder="https://youtu.be/..."
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isPending ? 'Generating...' : '⚡ Generate'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Example: From 1 To 50 → 50 blank levels ban jayenge.
      </p>
    </form>
  );
}