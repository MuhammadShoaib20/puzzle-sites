import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for does not exist. It may have been moved or deleted.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Go Home
        </Link>
        <Link
          href="/blog"
          className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
        >
          Read Blog
        </Link>
      </div>
    </div>
  );
}