'use client';

import { useState, useTransition } from 'react';
import { bulkSetLevelNoindex } from '@/lib/actions/levels';

export default function BulkNoindexForm({ gameId }: { gameId: string }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [isNoindex, setIsNoindex] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const fd = new FormData();
    fd.set('from', from);
    fd.set('to', to);
    fd.set('is_noindex', String(isNoindex));

    startTransition(async () => {
      const res = await bulkSetLevelNoindex(gameId, fd);
      if ('error' in res) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({
          type: 'success',
          text: `Updated ${res.updated} level${res.updated === 1 ? '' : 's'} — noindex ${isNoindex ? 'enabled' : 'disabled'}.`,
        });
      }
    });
  }

  const field = 'w-full px-3 py-2.5 border rounded-xl outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-[110px_110px_1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">From level</label>
          <input
            type="number"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            min="1"
            required
            placeholder="1351"
            className={field}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">To level</label>
          <input
            type="number"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            min="1"
            required
            placeholder="2600"
            className={field}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Action</label>
          <select
            value={isNoindex ? 'true' : 'false'}
            onChange={(e) => setIsNoindex(e.target.value === 'true')}
            className={field}
          >
            <option value="true">Set noindex = ON</option>
            <option value="false">Set noindex = OFF</option>
          </select>
        </div>
        <button type="submit" disabled={isPending} className="btn btn-primary btn-sm col-span-2 sm:col-span-1">
          {isPending ? 'Updating…' : 'Apply'}
        </button>
      </div>

      {message && (
        <p
          className="text-sm px-3 py-2 rounded-xl"
          style={
            message.type === 'error'
              ? { background: '#FEF2F2', color: '#B91C1C' }
              : { background: '#F0FDF4', color: '#15803D' }
          }
        >
          {message.text}
        </p>
      )}

      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        Example: From 1351 To 2600 marks every level in that range as noindex and removes them from the sitemap.
      </p>
    </form>
  );
}
