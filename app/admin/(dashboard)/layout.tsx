import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import BackgroundDecor from '@/components/BackgroundDecor';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings] = await Promise.all([auth(), getSettings()]);
  if (!session) redirect('/admin/login');

  return (
    <>
      <BackgroundDecor />
      <div className="admin-shell">
        <AdminSidebar
          siteName={settings?.site_name || 'PuzzleWalkthroughs'}
          siteLogo={settings?.site_logo || null}
        />
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
