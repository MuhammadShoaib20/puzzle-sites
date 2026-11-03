'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  onDone?: () => void;
  /** Large hero version with a submit button inside the field */
  big?: boolean;
  placeholder?: string;
};

export default function NavbarSearch({ onDone, big = false, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const settledQuery = useRef('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = (inputRef.current?.value ?? settledQuery.current).trim();
    if (!q) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onDone?.();
  }

  function handleInputChange(value: string) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      settledQuery.current = value;
    }, 300);
  }

  return (
    <form onSubmit={handleSearch} className={`search-wrap ${big ? 'search-big' : ''}`} role="search">
      <svg
        className="search-icon"
        width="18"
        height="18"
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
        ref={inputRef}
        type="text"
        defaultValue=""
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder || 'Search games…'}
        aria-label="Search games"
        className="search-input"
      />
      {big && (
        <button type="submit" className="btn btn-primary btn-sm search-submit">
          Search
        </button>
      )}
    </form>
  );
}
