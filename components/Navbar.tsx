'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-blue-600 whitespace-nowrap">
          🧩 PuzzleWalkthroughs
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games or levels..."
            className="w-full px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="hidden md:flex gap-4 text-sm">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
          <Link href="/about" className="hover:text-blue-600">About</Link>
        </div>
      </div>
    </nav>
  );
}