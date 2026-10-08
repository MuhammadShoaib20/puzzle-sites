'use client';

import { useState, useActionState } from 'react';
import { bulkEditLevels } from '@/lib/actions/levels';

type Level = {
  id?: string;
  level_number: number;
  title: string;
  youtube_url: string;
  youtube_id?: string;
  description?: string;
  walkthrough?: string;
  tips?: string;
  published: boolean;
};

type Props = {
  gameId: string;
  existingLevels: Level[];
};

export default function BulkEditForm({ gameId, existingLevels }: Props) {
  const [levels, setLevels] = useState<Level[]>(existingLevels);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await bulkEditLevels(gameId, formData);
      return result ?? null;
    },
    null
  );

  function handleLevelChange(index: number, field: keyof Level, value: string | boolean) {
    const updated = [...levels];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-extract YouTube ID when URL changes
    if (field === 'youtube_url' && typeof value === 'string') {
      const match = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) {
        updated[index].youtube_id = match[1];
      } else {
        updated[index].youtube_id = '';
      }
    }

    setLevels(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('levels_json', JSON.stringify(levels));
    formAction(fd);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Bulk Edit All Levels</h3>
        <button
          type="button"
          onClick={() => setIsBulkMode(!isBulkMode)}
          className="btn btn-secondary btn-sm"
        >
          {isBulkMode ? 'Close Bulk Edit' : 'Open Bulk Edit'}
        </button>
      </div>

      {isBulkMode && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {state?.error && (
            <div
              role="alert"
              style={{
                background: '#FEF2F2',
                color: '#B91C1C',
                border: '1.5px solid #FECACA',
                borderRadius: 14,
                padding: '14px 16px',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                ❌ Could not save levels
              </div>
              <div>{state.error}</div>
            </div>
          )}

          <div className="max-h-[600px] overflow-y-auto space-y-3 p-4 border rounded-xl" style={{ background: '#F8FAFC' }}>
            {levels.map((level, index) => (
              <div
                key={level.id || index}
                className="grid grid-cols-1 md:grid-cols-[80px_1fr_auto] gap-3 p-4 bg-white rounded-lg border"
              >
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                    Level
                  </label>
                  <input
                    type="number"
                    value={level.level_number}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={level.title}
                    onChange={(e) => handleLevelChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder={`Level ${level.level_number}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                    Published
                  </label>
                  <button
                    type="button"
                    onClick={() => handleLevelChange(index, 'published', !level.published)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold ${
                      level.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {level.published ? '✓ Published' : '✗ Draft'}
                  </button>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={level.youtube_url}
                    onChange={(e) => handleLevelChange(index, 'youtube_url', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={level.description || ''}
                    onChange={(e) => handleLevelChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Short description for this level"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                    Walkthrough (optional)
                  </label>
                  <textarea
                    value={level.walkthrough || ''}
                    onChange={(e) => handleLevelChange(index, 'walkthrough', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    placeholder="Step-by-step walkthrough..."
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                    Tips (optional)
                  </label>
                  <textarea
                    value={level.tips || ''}
                    onChange={(e) => handleLevelChange(index, 'tips', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    placeholder="Helpful tips for this level..."
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? 'Saving All Levels…' : `Save All ${levels.length} Levels`}
            </button>
            <button
              type="button"
              onClick={() => setIsBulkMode(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!isBulkMode && (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Click "Open Bulk Edit" to edit all levels at once and save in one click.
        </p>
      )}
    </div>
  );
}
