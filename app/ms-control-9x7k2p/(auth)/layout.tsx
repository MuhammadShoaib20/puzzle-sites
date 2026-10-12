import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex, nofollow, noarchive, nosnippet',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
