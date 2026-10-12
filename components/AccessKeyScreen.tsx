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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Required</h1>
            <p className="text-gray-600 dark:text-gray-400">Enter your access key to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="access-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Key
              </label>
              <input
                id="access-key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter 8-digit code"
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || key.length !== 8}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
