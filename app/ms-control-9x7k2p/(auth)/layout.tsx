import type { Metadata } from 'next';
import PwaInstallButton from '@/components/PwaInstallButton';

export const metadata: Metadata = {
  robots: 'noindex, nofollow, noarchive, nosnippet',
  manifest: '/admin-manifest',
  icons: {
    apple: [{ url: '/pw-admin-icon', sizes: '512x512', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'PW Admin',
    statusBarStyle: 'default',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaInstallButton />
      {children}
    </>
  );
}
