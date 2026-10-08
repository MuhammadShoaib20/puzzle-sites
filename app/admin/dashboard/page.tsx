import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome, {session.user?.email}
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-6 bg-white shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Games</div>
          <div className="text-3xl font-bold">0</div>
        </div>
        <div className="border rounded-xl p-6 bg-white shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Levels</div>
          <div className="text-3xl font-bold">0</div>
        </div>
        <div className="border rounded-xl p-6 bg-white shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Blogs</div>
          <div className="text-3xl font-bold">0</div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        🚧 Full admin panel Phase 3 me banega — abhi sirf login test ho raha hai.
      </div>
    </div>
  );
}