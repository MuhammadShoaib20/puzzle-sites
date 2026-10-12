'use client';

import { useState } from 'react';
import type { ActivityEntry } from '@/lib/db';

type Props = {
  activities: ActivityEntry[];
  summary: {
    totalLoginsToday: number;
    failedAttemptsToday: number;
    lastSuccessfulLogin: string | null;
  };
  suspiciousIPs: string[];
  adminPath: string;
};

export default function ActivityLog({ activities, summary, suspiciousIPs, adminPath }: Props) {
  const [filter, setFilter] = useState<'all' | 'logins' | 'failures' | 'admin_actions'>('all');

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    if (filter === 'logins') return activity.type === 'login';
    if (filter === 'failures') return activity.status === 'failure';
    if (filter === 'admin_actions') return activity.type === 'admin_action';
    return true;
  });

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatAbsoluteTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const parseUserAgent = (userAgent: string) => {
    let browser = 'Unknown';
    let device = 'Unknown';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) device = 'iOS';
    else if (userAgent.includes('Android')) device = 'Android';
    else if (userAgent.includes('Windows')) device = 'Windows';
    else if (userAgent.includes('Mac')) device = 'Mac';
    else if (userAgent.includes('Linux')) device = 'Linux';

    return { browser, device };
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return '🔐';
    if (action.includes('logout')) return '🚪';
    if (action.includes('password')) return '🔑';
    if (action.includes('create')) return '➕';
    if (action.includes('update') || action.includes('edit')) return '✏️';
    if (action.includes('delete')) return '🗑️';
    return '📋';
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Logins Today</div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{summary.totalLoginsToday}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Failed Attempts Today</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.failedAttemptsToday}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Successful Login</div>
          <div className="text-sm font-medium">
            {summary.lastSuccessfulLogin ? formatRelativeTime(summary.lastSuccessfulLogin) : 'Never'}
          </div>
          {summary.lastSuccessfulLogin && (
            <div className="text-xs text-gray-500 dark:text-gray-500" title={formatAbsoluteTime(summary.lastSuccessfulLogin)}>
              {formatAbsoluteTime(summary.lastSuccessfulLogin)}
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Activity Log</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Activity</option>
            <option value="logins">Logins Only</option>
            <option value="failures">Failures Only</option>
            <option value="admin_actions">Admin Actions</option>
          </select>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No activity yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Action</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Email</th>
                  <th className="text-left py-2 px-3 font-medium">IP Address</th>
                  <th className="text-left py-2 px-3 font-medium">Device</th>
                  <th className="text-left py-2 px-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => {
                  const { browser, device } = parseUserAgent(activity.user_agent);
                  const isSuspicious = suspiciousIPs.includes(activity.ip_address);

                  return (
                    <tr
                      key={activity.id}
                      className={`border-b last:border-0 ${isSuspicious ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span>{getActionIcon(activity.action)}</span>
                          <span className="truncate max-w-[200px]" title={activity.action}>
                            {activity.action}
                          </span>
                          {isSuspicious && (
                            <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                              ⚠️ Suspicious
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            activity.status === 'success'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {activity.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                        {activity.email}
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                        {activity.ip_address}
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                        <div className="text-xs">
                          <div>{browser}</div>
                          <div className="text-gray-500 dark:text-gray-500">{device}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                        <div title={formatAbsoluteTime(activity.created_at)}>
                          {formatRelativeTime(activity.created_at)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
