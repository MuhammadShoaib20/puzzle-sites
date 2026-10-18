'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

const LEVELS_PER_PAGE = 1000;

function getPageItems(page: number, pageCount: number): Array<number | 'ellipsis'> {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= pageCount)
    .sort((a, b) => a - b);

  return pages.flatMap((pageNumber, index) => {
    const previousPage = pages[index - 1];
    return [
      ...(previousPage && pageNumber - previousPage > 1 ? ['ellipsis' as const] : []),
      pageNumber,
    ];
  });
}

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
  const [page, setPage] = useState(1);
  const [jumpRequest, setJumpRequest] = useState(0);
  const pendingJump = useRef<number | null>(null);

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

  const isSearching = query.trim().length > 0;
  const highestLevelNumber = levels.reduce(
    (highest, level) => Math.max(highest, level.level_number),
    0
  );
  const pageCount = isSearching
    ? Math.max(1, Math.ceil(filtered.length / LEVELS_PER_PAGE))
    : Math.max(1, Math.ceil(highestLevelNumber / LEVELS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = getPageItems(currentPage, pageCount);
  const visibleLevels = isSearching
    ? filtered.slice((currentPage - 1) * LEVELS_PER_PAGE, currentPage * LEVELS_PER_PAGE)
    : filtered.filter(
        (level) =>
          level.level_number > (currentPage - 1) * LEVELS_PER_PAGE &&
          level.level_number <= currentPage * LEVELS_PER_PAGE
      );
  const firstVisibleLevel =
    isSearching && filtered.length === 0
      ? 0
      : (currentPage - 1) * LEVELS_PER_PAGE + 1;
  const lastVisibleLevel = isSearching
    ? Math.min(currentPage * LEVELS_PER_PAGE, filtered.length)
    : currentPage * LEVELS_PER_PAGE;

  useEffect(() => {
    if (pendingJump.current === null) return;

    const element = document.getElementById(`level-tile-${pendingJump.current}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.classList.add('level-tile-flash');
    if (element) {
      window.setTimeout(() => element.classList.remove('level-tile-flash'), 1200);
    }
    pendingJump.current = null;
  }, [currentPage, jumpRequest]);

  function jumpToExactMatch() {
    if (!exactMatch) return;

    const matchIndex = filtered.findIndex(
      (level) => level.level_number === exactMatch.level_number
    );
    if (matchIndex < 0) return;

    pendingJump.current = exactMatch.level_number;
    setJumpRequest((request) => request + 1);
    setPage(Math.floor(matchIndex / LEVELS_PER_PAGE) + 1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && exactMatch) {
      e.preventDefault();
      jumpToExactMatch();
    }
  }

  function renderPagination() {
    if (pageCount <= 1) return null;

    return (
      <nav className="level-pagination" aria-label="Level pages">
        <button
          type="button"
          className="level-page-arrow"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <span aria-hidden="true">←</span>
          <span className="level-page-arrow-label">Previous</span>
        </button>
        <div className="level-page-numbers">
          {pageItems.map((item, index) =>
            item === 'ellipsis' ? (
              <span className="level-page-ellipsis" key={`ellipsis-${index}`} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`level-page-number${currentPage === item ? ' active' : ''}`}
                onClick={() => setPage(item)}
                aria-label={`Go to page ${item}`}
                aria-current={currentPage === item ? 'page' : undefined}
              >
                {item}
              </button>
            )
          )}
        </div>
        <button
          type="button"
          className="level-page-arrow"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === pageCount}
          aria-label="Next page"
        >
          <span className="level-page-arrow-label">Next</span>
          <span aria-hidden="true">→</span>
        </button>
      </nav>
    );
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
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Find or go to a level…"
            aria-label="Search levels"
            className="level-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setPage(1);
              }}
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

      {renderPagination()}

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
            {visibleLevels.map((level) => (
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
          {pageCount > 1 && (
            <div className="level-pagination-footer">
              {isSearching ? (
                <p className="level-page-summary">
                  Showing <strong>{firstVisibleLevel}–{lastVisibleLevel}</strong> of{' '}
                  <strong>{filtered.length}</strong> matching levels
                </p>
              ) : (
                <p className="level-page-summary">
                  Levels <strong>{firstVisibleLevel}–{lastVisibleLevel}</strong>
                  {' · '}
                  <strong>{visibleLevels.length}</strong> walkthroughs
                </p>
              )}
              {renderPagination()}
            </div>
          )}
        </>
      )}
    </section>
  );
}
