import type { Metadata } from 'next';
import { getSettings } from '@/lib/db';
import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const settings = await getSettings();

  return (
    <LoginForm
      siteName={settings?.site_name || 'PuzzleWalkthroughs'}
      siteLogo={settings?.site_logo || null}
    />
  );
}
