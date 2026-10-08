'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  onDone?: () => void;
  /** Large hero version with a submit button inside the field */
  big?: boolean;
  placeholder?: string;
};

export default function NavbarSearch({ onDone, big = false, placeholder }: Props) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onDone?.();
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
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
