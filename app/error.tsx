'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
      >
        Try again
      </button>
    </div>
  );
}