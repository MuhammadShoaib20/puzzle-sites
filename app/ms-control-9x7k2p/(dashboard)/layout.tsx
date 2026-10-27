import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { getSettings } from '@/lib/db';
import { getAdminPath } from '@/lib/admin-path';
import type { Metadata } from 'next';
import AdminToastProvider from '@/components/AdminToastProvider';
import PwaInstallButton from '@/components/PwaInstallButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

const ADMIN_PATH = process.env.ADMIN_SECRET_PATH || 'ms-control-9x7k2p';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings] = await Promise.all([auth(), getSettings()]);
  if (!session) redirect(`/${ADMIN_PATH}/login`);

  const adminPath = getAdminPath();

  return (
    <>
      <PwaInstallButton />
      <div className="admin-shell">
        <AdminSidebar
          siteName={settings?.site_name || 'PuzzleWalkthroughs'}
          siteLogo={settings?.site_logo || null}
          adminPath={adminPath}
        />
        <main className="admin-main">
          <AdminToastProvider>{children}</AdminToastProvider>
        </main>
      </div>
    </>
  );
}
