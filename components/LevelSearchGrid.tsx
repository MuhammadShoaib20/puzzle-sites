'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Level = {
  id: string;
  level_number: number;
  title?: string | null;
};

type Props = {
  gameSlug: string;
  levels: Level[];
};

export default function LevelSearchGrid({ gameSlug, levels }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return levels;

    // If query is only digits, filter by level_number prefix/exact
    if (/^\d+$/.test(q)) {
      return levels.filter((l) => String(l.level_number).includes(q));
    }

    // Otherwise filter by title
    const lower = q.toLowerCase();
    return levels.filter((l) =>
      (l.title || `level ${l.level_number}`).toLowerCase().includes(lower)
    );
  }, [levels, query]);

  // Exact match — for the "Go" button
  const exactMatch = useMemo(() => {
    if (!/^\d+$/.test(query.trim())) return null;
    const num = parseInt(query.trim(), 10);
    return levels.find((l) => l.level_number === num) || null;
  }, [levels, query]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && exactMatch) {
      e.preventDefault();
      // Scroll to the tile
      const el = document.getElementById(`level-tile-${exactMatch.level_number}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash highlight
      el?.classList.add('level-tile-flash');
      setTimeout(() => el?.classList.remove('level-tile-flash'), 1200);
    }
  }

  return (
    <section className="section" id="levels" style={{ scrollMarginTop: 90 }}>
      <div className="section-head">
        <div>
          <h2 className="section-title">All levels</h2>
          <p className="section-sub">
            {levels.length} walkthroughs — tap a level to open it
          </p>
        </div>

        {/* Search input */}
        <div className="level-search">
          <svg
            className="level-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            inputMode="numeric"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Go to level…"
            aria-label="Search levels"
            className="level-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="level-search-clear"
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Info line when filtering */}
      {query.trim() && (
        <p className="level-search-info">
          {filtered.length === 0 ? (
            <>
              No levels match <strong>&quot;{query}&quot;</strong>
            </>
          ) : (
            <>
              Showing <strong>{filtered.length}</strong> of {levels.length} levels
              {exactMatch && (
                <>
                  {' · '}
                  <a href={`#level-tile-${exactMatch.level_number}`} className="level-search-jump">
                    Jump to Level {exactMatch.level_number} ↓
                  </a>
                </>
              )}
            </>
          )}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🔍</div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No levels match your search.
          </p>
        </div>
      ) : (
        <div className="level-grid">
          {filtered.map((level) => (
            <Link
              key={level.id}
              id={`level-tile-${level.level_number}`}
              href={`/game/${gameSlug}/level-${level.level_number}`}
              className="level-tile"
              title={level.title || `Level ${level.level_number}`}
            >
              {level.level_number}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
