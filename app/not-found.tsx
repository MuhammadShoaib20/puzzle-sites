import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 sm:px-6 text-center animate-fade-in-up">
      {/* Large 404 Tiles */}
      <div className="tile-strip scale-150" style={{ marginTop: 0, marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        <span className="tile solved">4</span>
        <span className="tile stuck">0</span>
        <span className="tile solved">4</span>
      </div>

      {/* Main Heading */}
      <h1 className="page-title text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
        Level not found
      </h1>

      {/* Subheading with icon */}
      <p className="page-sub text-lg sm:text-xl max-w-lg mx-auto mb-2">
        🧩 The puzzle piece you&apos;re looking for doesn&apos;t fit here
      </p>

      {/* Additional description */}
      <p className="text-sm sm:text-base max-w-md mx-auto mb-8 opacity-80">
        The page may have been moved, deleted, or never existed. Let&apos;s get you back on track.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3 sm:gap-4 flex-wrap justify-center btn-stack">
        <Link
          href="/"
          className="btn btn-primary px-6 py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          🏠 Go home
        </Link>
        <Link
          href="/blog"
          className="btn btn-secondary px-6 py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          📖 Read guides
        </Link>
      </div>

      {/* Additional help links */}
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
