import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/require-auth';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import ActivityLog from '@/components/ActivityLog';
import { getRecentActivity, getActivitySummary, getSuspiciousIPs } from '@/lib/db';
import { getAdminPath } from '@/lib/admin-path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SecurityPage() {
  const session = await requireAuth();
  const adminPath = getAdminPath();

  const [activities, summary, suspiciousIPs] = await Promise.all([
    getRecentActivity(20),
    getActivitySummary(),
    getSuspiciousIPs(),
  ]);

  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Security</h1>
          <p className="admin-sub">Manage your account security</p>
        </div>
      </div>

      <PasswordChangeForm adminPath={adminPath} />

      <ActivityLog activities={activities} summary={summary} suspiciousIPs={suspiciousIPs} adminPath={adminPath} />

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-bold border-b pb-3">Security Settings</h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✅ Three-layer authentication (Access Key + Email/Password + Rate Limiting)</li>
          <li>✅ Login attempt logging</li>
          <li>✅ 30-minute session timeout</li>
          <li>✅ Security headers enabled</li>
          <li>✅ Admin path hidden (obscure URL)</li>
          <li>✅ Noindex on all admin pages</li>
        </ul>
      </div>
    </div>
  );
}
