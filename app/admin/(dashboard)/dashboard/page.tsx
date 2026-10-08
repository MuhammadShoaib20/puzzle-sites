import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [games, levels, blogs] = await Promise.all([
    supabaseAdmin.from('games').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('levels').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('blogs').select('*', { count: 'exact', head: true }),
  ]);

  return {
    games: games.count || 0,
    levels: levels.count || 0,
    blogs: blogs.count || 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'Games', value: stats.games, icon: '🎮', href: '/admin/games', color: 'bg-blue-500' },
    { label: 'Levels', value: stats.levels, icon: '🎯', href: '/admin/games', color: 'bg-green-500' },
    { label: 'Blogs', value: stats.blogs, icon: '📝', href: '/admin/blogs', color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back to your admin panel</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
              <span className={`${card.color} text-white text-xs px-2 py-1 rounded-full`}>
                View
              </span>
            </div>
            <div className="text-4xl font-bold mb-1">{card.value}</div>
            <div className="text-sm text-gray-500">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/games/new"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Game
          </Link>
          <Link
            href="/admin/blogs"
            className="border border-gray-300 px-5 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            + Add Blog
          </Link>
          <Link
            href="/admin/settings"
            className="border border-gray-300 px-5 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            ⚙️ Site Settings
          </Link>
        </div>
      </div>
    </div>
  );
}