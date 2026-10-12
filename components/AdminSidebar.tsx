'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useMemo } from 'react';
import { signOut } from 'next-auth/react';
import { logLogout } from '@/lib/actions/security';

const getLinks = (adminPath: string) => [
  { href: `/${adminPath}/dashboard`, label: 'Dashboard', icon: '📊' },
  { href: `/${adminPath}/games`, label: 'Games', icon: '🎮' },
  { href: `/${adminPath}/blogs`, label: 'Blogs', icon: '📝' },
  { href: `/${adminPath}/pages`, label: 'Pages', icon: '📄' },
  { href: `/${adminPath}/settings`, label: 'Settings', icon: '⚙️' },
  { href: `/${adminPath}/security`, label: 'Security', icon: '🔒' },
];

type Props = {
  siteName: string;
  siteLogo: string | null;
  adminPath: string;
};

function AdminBrand({
  siteName,
  siteLogo,
  compact = false,
  onClick,
  adminPath,
}: {
  siteName: string;
  siteLogo: string | null;
  compact?: boolean;
  onClick?: () => void;
  adminPath: string;
}) {
  return (
    <Link href={`/${adminPath}/dashboard`} onClick={onClick} className="brand">
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
  adminPath,
}: {
  onNavigate?: () => void;
  siteName: string;
  siteLogo: string | null;
  adminPath: string;
}) {
  const pathname = usePathname();
  const links = useMemo(() => getLinks(adminPath), [adminPath]);

  return (
    <>
      <div className="admin-brand-row">
        <AdminBrand siteName={siteName} siteLogo={siteLogo} onClick={onNavigate} adminPath={adminPath} />
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
        <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-link">
          <span className="ico" aria-hidden="true">🌐</span>
          <span>View site</span>
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logLogout();
            await signOut({ callbackUrl: `/${adminPath}/login` });
          }}
          className="admin-link danger"
        >
          <span className="ico" aria-hidden="true">🚪</span>
          <span>Sign out</span>
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar({ siteName, siteLogo, adminPath }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="admin-side">
        <SidebarContent siteName={siteName} siteLogo={siteLogo} adminPath={adminPath} />
      </aside>

      {/* Mobile / tablet top bar */}
      <div className="admin-topbar">
        <div style={{ color: '#fff' }}>
          <AdminBrand siteName={siteName} siteLogo={siteLogo} compact adminPath={adminPath} />
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
            adminPath={adminPath}
            onNavigate={() => setOpen(false)}
          />
        </aside>
      </div>
    </>
  );
}
