'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type Props = {
  siteName: string;
  siteLogo: string | null;
  adminPath: string;
  message?: string;
};

export default function LoginForm({ siteName, siteLogo, adminPath, message }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (message === 'password_changed') {
      setSuccess('Password changed successfully. Please login with your new password.');
    } else if (message === 'sessions_invalidated') {
      setSuccess('All sessions have been invalidated. Please login again.');
    }
  }, [message]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userAgent = navigator.userAgent;

      const res = await signIn('credentials', {
        email,
        password,
        userAgent,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push(`/${adminPath}/dashboard`);
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="card p-7 sm:p-9 w-full max-w-md relative animate-fade-in-up"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        {/* Logo / Brand */}
        <div className="flex justify-center mb-5">
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {siteLogo ? (
              <Image
                src={siteLogo}
                alt={siteName}
                width={180}
                height={60}
                style={{
                  height: 56,
                  width: 'auto',
                  maxWidth: 200,
                  objectFit: 'contain',
                }}
                priority
                unoptimized
              />
            ) : (
              <span
                className="brand-mark"
                style={{ width: 56, height: 56, fontSize: 28, borderRadius: 18 }}
                aria-hidden="true"
              >
                🧩
              </span>
            )}
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold mb-1 text-center">Admin login</h1>
        <p className="text-sm text-center mb-7" style={{ color: 'var(--muted)' }}>
          Sign in to manage {siteName}
        </p>

        {success && (
          <div
            role="alert"
            className="p-3 rounded-xl mb-5 text-sm font-medium"
            style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}
          >
            {success}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl mb-5 text-sm font-medium"
            style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}
          >
            {error}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full mt-1.5 px-4 py-3 border rounded-xl outline-none"
            style={{ borderColor: 'var(--line)' }}
            placeholder="admin@yoursite.com"
          />
        </label>

        <label className="block mb-7">
          <span className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full mt-1.5 px-4 py-3 border rounded-xl outline-none"
            style={{ borderColor: 'var(--line)' }}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-semibold hover:opacity-80"
            style={{ color: 'var(--muted)' }}
          >
            ← Back to site
          </Link>
        </div>
      </form>
    </div>
  );
}
