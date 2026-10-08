import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 sm:px-6 text-center animate-fade-in-up">
      <div className="tile-strip" style={{ marginTop: 0, marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <span className="tile solved">4</span>
        <span className="tile stuck">0</span>
        <span className="tile solved">4</span>
      </div>
      <h1 className="page-title">This level doesn&apos;t exist</h1>
      <p className="page-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        The page you&apos;re looking for was moved or never existed. Head back and pick another game.
      </p>
      <div className="flex gap-3 sm:gap-4 flex-wrap justify-center mt-6 sm:mt-8 btn-stack">
        <Link href="/" className="btn btn-primary">Go home</Link>
        <Link href="/blog" className="btn btn-secondary">Read guides</Link>
      </div>
    </div>
  );
}
