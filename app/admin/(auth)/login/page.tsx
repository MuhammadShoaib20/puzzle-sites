'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push('/admin/dashboard');
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
      style={{ background: 'linear-gradient(180deg, #D4ECFF 0%, #F3F9FF 100%)' }}
    >
      <div className="hero-dots" />
      <div className="hero-blob b1" />
      <div className="hero-blob b2" />

      <form
        onSubmit={handleSubmit}
        className="card p-7 sm:p-9 w-full max-w-md relative animate-fade-in-up"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex justify-center mb-5">
          <span className="brand-mark" style={{ width: 56, height: 56, fontSize: 28, borderRadius: 18 }}>
            🧩
          </span>
        </div>
        <h1 className="text-2xl font-extrabold mb-1 text-center">Admin login</h1>
        <p className="text-sm text-center mb-7" style={{ color: 'var(--muted)' }}>
          Sign in to manage your site
        </p>

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
      </form>
    </div>
  );
}
