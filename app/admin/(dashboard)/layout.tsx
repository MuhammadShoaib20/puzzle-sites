import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import BackgroundDecor from '@/components/BackgroundDecor';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  return (
    <>
      <BackgroundDecor />
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
