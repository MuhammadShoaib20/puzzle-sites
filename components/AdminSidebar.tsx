'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/games', label: 'Games', icon: '🎮' },
  { href: '/admin/blogs', label: 'Blogs', icon: '📝' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

type Props = {
  siteName: string;
  siteLogo: string | null;
};

function AdminBrand({
  siteName,
  siteLogo,
  compact = false,
  onClick,
}: {
  siteName: string;
  siteLogo: string | null;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href="/admin/dashboard" onClick={onClick} className="brand">
      {siteLogo ? (
        <Image
          src={siteLogo}
          alt={siteName}
          width={180}
          height={60}
          className={compact ? 'h-8 w-auto max-w-[110px] object-contain' : 'h-9 w-auto max-w-[150px] object-contain'}
          unoptimized
        />
      ) : (
        <>
          <span
            className="brand-mark"
            aria-hidden="true"
            style={compact ? { width: 36, height: 36, fontSize: 18, borderRadius: 12 } : undefined}
          >
            🧩
          </span>
          <span>{compact ? 'Admin' : siteName}</span>
        </>
      )}
    </Link>
  );
}

function SidebarContent({
  onNavigate,
  siteName,
  siteLogo,
}: {
  onNavigate?: () => void;
  siteName: string;
  siteLogo: string | null;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="admin-brand-row">
        <AdminBrand siteName={siteName} siteLogo={siteLogo} onClick={onNavigate} />
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

export default function AdminSidebar({ siteName, siteLogo }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="admin-side">
        <SidebarContent siteName={siteName} siteLogo={siteLogo} />
      </aside>

      {/* Mobile / tablet top bar */}
      <div className="admin-topbar">
        <div style={{ color: '#fff' }}>
          <AdminBrand siteName={siteName} siteLogo={siteLogo} compact />
        </div>
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
          <SidebarContent
            siteName={siteName}
            siteLogo={siteLogo}
            onNavigate={() => setOpen(false)}
          />
        </aside>
      </div>
    </>
  );
}
