import type { Metadata } from 'next';
import { getSettings } from '@/lib/db';
import LoginWithAccessKey from '@/components/LoginWithAccessKey';
import { getAdminPath } from '@/lib/admin-path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const settings = await getSettings();
  const adminPath = getAdminPath();
  const params = await searchParams;

  return (
    <LoginWithAccessKey
      siteName={settings?.site_name || 'PuzzleWalkthroughs'}
      siteLogo={settings?.site_logo || null}
      adminPath={adminPath}
      message={params.message}
    />
  );
}
