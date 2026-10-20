'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Level = {
  id: string;
  level_number: number;
  title?: string;
  views: number;
};

type Props = {
  gameSlug: string;
  levels: Level[];
};

type LevelRange = {
  start: number;
  end: number;
  firstLevel: number;
};

function getLevelRanges(levels: Level[]): LevelRange[] {
  const firstLevels = new Map<number, number>();

  for (const level of levels) {
    if (level.level_number < 1) continue;
    const start = Math.floor((level.level_number - 1) / 100) * 100 + 1;
    if (!firstLevels.has(start)) firstLevels.set(start, level.level_number);
  }

  const highestLevel = levels.reduce(
    (highest, level) => Math.max(highest, level.level_number),
    0
  );

  return [...firstLevels.entries()]
    .sort(([firstStart], [secondStart]) => firstStart - secondStart)
    .map(([start, firstLevel]) => ({
      start,
      end: Math.min(start + 99, highestLevel),
      firstLevel,
    }));
}

export function LevelRangePagination({ levels }: { levels: Level[] }) {
  const ranges = getLevelRanges(levels);
  if (ranges.length === 0) return null;

  return (
    <nav className="level-range-pagination" aria-label="Level pagination">
      <span className="level-range-pagination-label">Jump to levels:</span>
      <div className="level-range-pagination-links">
        {ranges.map(({ start, end, firstLevel }) => (
          <a key={start} href={`#level-tile-${firstLevel}`}>
            Level {start}–{end}
          </a>
        ))}
      </div>
    </nav>
  );
}

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

  function jumpToExactMatch() {
    if (!exactMatch) return;
    document
      .getElementById(`level-tile-${exactMatch.level_number}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && exactMatch) {
      e.preventDefault();
      jumpToExactMatch();
    }
  }

  return (
    <section className="section" id="levels" style={{ scrollMarginTop: 90 }}>
      <div className="section-head">
        <div>
          <h2 className="section-title">All levels</h2>
          <p className="section-sub">
            {levels.length} walkthroughs — select a level to open its guide
          </p>
        </div>

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
            placeholder="Find or go to a level…"
            aria-label="Search levels"
            className="level-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="level-search-clear"
              aria-label="Clear level search"
            >
              ×
            </button>
          )}
        </div>
      </div>

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
                  <button
                    type="button"
                    className="level-search-jump"
                    onClick={jumpToExactMatch}
                  >
                    Go to Level {exactMatch.level_number} →
                  </button>
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
        <>
          <div className="level-grid">
            {filtered.map((level) => (
              <Link
                key={level.id}
                id={`level-tile-${level.level_number}`}
                href={`/game/${gameSlug}/level-${level.level_number}`}
                prefetch={false}
                className="level-tile"
                title={level.title || `Level ${level.level_number}`}
              >
                {level.level_number}
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
