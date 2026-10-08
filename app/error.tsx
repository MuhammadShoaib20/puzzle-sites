'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Client error:', {
      message: error.message,
      digest: error.digest,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="tile stuck mb-6" style={{ width: 72, height: 72, fontSize: 32 }}>!</div>
      <h2 className="page-title">Something went wrong</h2>
      <p className="page-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        We hit an unexpected error. Try again — if it keeps happening, contact support.
      </p>
      {error.digest && (
        <p className="text-xs mt-4 font-mono" style={{ color: 'var(--muted-light)' }}>
          Error ID: {error.digest}
        </p>
      )}
      <button onClick={reset} className="btn btn-primary mt-8">
        Try again
      </button>
    </div>
  );
}
