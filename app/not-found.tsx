import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 sm:px-6 text-center">
      <div className="flex items-center gap-3 mb-6 scale-[1.15]" aria-label="404 page code">
        <span className="level-tile current" style={{ width: 'clamp(52px, 12vw, 82px)', height: 'clamp(52px, 12vw, 82px)' }}>4</span>
        <span className="level-tile" style={{ width: 'clamp(52px, 12vw, 82px)', height: 'clamp(52px, 12vw, 82px)', background: '#FFF7ED', color: '#C2410C', borderColor: '#FDBA74' }}>0</span>
        <span className="level-tile current" style={{ width: 'clamp(52px, 12vw, 82px)', height: 'clamp(52px, 12vw, 82px)' }}>4</span>
      </div>

      <h1 className="page-title text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
        Level not found
      </h1>

      <p className="page-sub text-lg sm:text-xl max-w-lg mx-auto mb-2">
        🧩 The puzzle piece you&apos;re looking for doesn&apos;t fit here
      </p>

      <p className="text-sm sm:text-base max-w-md mx-auto mb-8 opacity-80">
        The page may have been moved, deleted, or never existed. Let&apos;s get you back on track.
      </p>

      <div className="flex gap-3 sm:gap-4 flex-wrap justify-center btn-stack">
        <Link href="/" className="btn btn-primary btn-lg">
          🏠 Go home
        </Link>
        <Link href="/blog" className="btn btn-secondary btn-lg">
          📖 Read guides
        </Link>
      </div>

      <div className="mt-8 sm:mt-10 flex gap-4 sm:gap-6 text-sm opacity-70">
        <Link href="/about" className="hover:opacity-100 transition-opacity">
          About
        </Link>
        <span>•</span>
        <Link href="/contact" className="hover:opacity-100 transition-opacity">
          Contact
        </Link>
        <span>•</span>
        <Link href="/search" className="hover:opacity-100 transition-opacity">
          Search
        </Link>
      </div>
    </div>
  );
}
