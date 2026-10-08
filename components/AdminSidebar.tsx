'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/games', label: 'Games', icon: '🎮' },
  { href: '/admin/blogs', label: 'Blogs', icon: '📝' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="admin-brand-row">
        <Link href="/admin/dashboard" onClick={onNavigate} className="brand">
          <span className="brand-mark" aria-hidden="true">🧩</span>
          <span>Admin panel</span>
        </Link>
      </div>

      <nav className="admin-nav" aria-label="Admin">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`admin-link ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="ico" aria-hidden="true">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-foot">
        <Link href="/" target="_blank" className="admin-link">
          <span className="ico" aria-hidden="true">🌐</span>
          <span>View site</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="admin-link danger"
        >
          <span className="ico" aria-hidden="true">🚪</span>
          <span>Sign out</span>
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="admin-side">
        <SidebarContent />
      </aside>

      {/* Mobile / tablet top bar */}
      <div className="admin-topbar">
        <Link href="/admin/dashboard" className="brand" style={{ color: '#fff' }}>
          <span className="brand-mark" style={{ width: 36, height: 36, fontSize: 18 }} aria-hidden="true">
            🧩
          </span>
          <span>Admin</span>
        </Link>
        <button
          type="button"
          className="menu-btn"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span className="menu-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* Drawer (mobile / tablet only) */}
      <div className={`admin-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="backdrop" onClick={() => setOpen(false)} />
        <aside className="panel" inert={!open}>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}
