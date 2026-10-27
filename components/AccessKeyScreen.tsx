'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ACCESS_KEY_COOKIE = 'admin_access_key';
const COOKIE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

type Props = {
  correctKey: string;
  onSuccess: () => void;
};

export function useAccessKey(): boolean {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${ACCESS_KEY_COOKIE}=`));
      if (cookie) {
        const value = cookie.split('=')[1];
        const timestamp = parseInt(value, 10);
        if (Date.now() < timestamp) {
          setHasAccess(true);
        } else {
          // Cookie expired
          document.cookie = `${ACCESS_KEY_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          setHasAccess(false);
        }
      }
    };

    checkAccess();
  }, []);

  return hasAccess;
}

export function setAccessKeyCookie() {
  const expiry = Date.now() + COOKIE_EXPIRY;
  document.cookie = `${ACCESS_KEY_COOKIE}=${expiry}; expires=${new Date(expiry).toUTCString()}; path=/; SameSite=Strict; Secure`;
}

export function clearAccessKeyCookie() {
  document.cookie = `${ACCESS_KEY_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export default function AccessKeyScreen({ correctKey, onSuccess }: Props) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate slight delay to prevent timing attacks
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (key === correctKey) {
      setAccessKeyCookie();
      onSuccess();
    } else {
      setError('Invalid access key');
      setKey('');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="card p-8" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Access Required</h1>
            <p style={{ color: 'var(--muted)' }}>Enter your access key to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="access-key" className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-soft)' }}>
                Access Key
              </label>
              <input
                id="access-key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter 8-digit code"
                maxLength={8}
                className="w-full px-4 py-3"
                style={{ borderRadius: '12px', border: '1.5px solid #94A3B8', background: '#fff', color: 'var(--ink)' }}
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <p className="text-sm" style={{ color: '#B91C1C' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || key.length !== 8}
              className="btn btn-primary btn-block"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
