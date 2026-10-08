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
    { label: 'Games', value: stats.games, icon: '🎮', href: '/admin/games', bg: 'linear-gradient(180deg,#38BDF8,#0284C7)' },
    { label: 'Levels', value: stats.levels, icon: '🎯', href: '/admin/games', bg: 'linear-gradient(180deg,#A5B4FC,#6366F1)' },
    { label: 'Blogs', value: stats.blogs, icon: '📝', href: '/admin/blogs', bg: 'linear-gradient(180deg,#FDBA74,#FB923C)' },
  ];

  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-sub">Welcome back to your admin panel</p>
        </div>
        <Link href="/" target="_blank" className="btn btn-secondary btn-sm">
          View site
        </Link>
      </div>

      <div className="admin-stats">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="card card-hover admin-stat">
            <span className="admin-stat-icon" style={{ background: card.bg }} aria-hidden="true">
              {card.icon}
            </span>
            <div>
              <div className="admin-stat-num">{card.value}</div>
              <div className="admin-stat-label">{card.label}</div>
            </div>
            <span className="admin-stat-go" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      <div className="card admin-panel">
        <h2>Quick actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/games/new" className="btn btn-primary btn-sm">
            + Add game
          </Link>
          <Link href="/admin/blogs/new" className="btn btn-accent btn-sm">
            + Add blog
          </Link>
          <Link href="/admin/settings" className="btn btn-secondary btn-sm">
            ⚙️ Site settings
          </Link>
        </div>
      </div>
    </div>
  );
}
