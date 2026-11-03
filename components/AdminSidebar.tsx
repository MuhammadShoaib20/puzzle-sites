'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { logLogout } from '@/lib/actions/security';
import ThemeToggle from '@/components/ThemeToggle';

const getLinks = (adminPath: string) => [
  { href: `/${adminPath}/dashboard`, label: 'Dashboard overview', icon: '📊' },
  { href: `/${adminPath}/games`, label: 'Manage games', icon: '🎮' },
  { href: `/${adminPath}/games/bulk-screenshots`, label: 'Level walkthroughs', icon: '🖼️' },
  { href: `/${adminPath}/blogs`, label: 'Blog & content', icon: '📝' },
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
  onClick,
  adminPath,
}: {
  siteName: string;
  siteLogo: string | null;
  onClick?: () => void;
  adminPath: string;
}) {
  return (
    <Link href={`/${adminPath}/dashboard`} onClick={onClick} className="brand">
      {siteLogo ? (
        <span className="admin-header-brand">
          <Image
            src={siteLogo}
            alt={siteName}
            width={180}
            height={60}
            className="admin-header-logo"
            unoptimized
          />
          <span className="admin-header-brand-copy">
            <strong>{siteName}</strong>
            <span>Admin workspace</span>
          </span>
        </span>
      ) : (
        <span className="admin-header-brand">
          <span className="brand-mark" aria-hidden="true">🧩</span>
          <span className="admin-header-brand-copy">
            <strong>{siteName}</strong>
            <span>Admin workspace</span>
          </span>
        </span>
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
      </div>
    </>
  );
}

export default function AdminSidebar({ siteName, siteLogo, adminPath }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const links = useMemo(() => getLinks(adminPath), [adminPath]);
  const filteredLinks = links.filter((link) =>
    link.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (!searchOpen && !profileOpen && !open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
        setOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [searchOpen, profileOpen, open]);

  async function handleSignOut() {
    await logLogout();
    await signOut({ callbackUrl: `/${adminPath}/login` });
  }

  return (
    <>
      <header className="admin-topbar">
        <AdminBrand siteName={siteName} siteLogo={siteLogo} adminPath={adminPath} />

        <div className="admin-header-search" ref={searchRef}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSearchOpen(false);
                event.currentTarget.blur();
              }
            }}
            placeholder="Search admin modules..."
            aria-label="Search admin modules"
            aria-controls="admin-search-results"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="admin-search-clear"
              aria-label="Clear module search"
              onClick={() => {
                setQuery('');
                setSearchOpen(true);
              }}
            >
              ×
            </button>
          )}
          <div
            className="admin-search-results"
            id="admin-search-results"
            hidden={!searchOpen}
          >
            <span className="admin-search-heading">
              {query.trim() ? 'Matching modules' : 'Quick navigation'}
            </span>
            {filteredLinks.length ? (
              filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="admin-search-result"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery('');
                  }}
                >
                  <span aria-hidden="true">{link.icon}</span>
                  <span>{link.label}</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))
            ) : (
              <p className="admin-search-empty">No admin modules match “{query}”.</p>
            )}
          </div>
        </div>

        <div className="admin-header-actions">
          <Link href={`/${adminPath}/games/new`} className="btn btn-primary admin-quick-action">
            <span aria-hidden="true">+</span> Add game
          </Link>
          <Link href={`/${adminPath}/blogs/new`} className="btn btn-secondary admin-quick-action">
            <span aria-hidden="true">+</span> Add blog
          </Link>
        </div>

        <div className="admin-profile" ref={profileRef}>
          <button
            type="button"
            className="admin-profile-trigger"
            aria-label="Open administrator menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => setProfileOpen((current) => !current)}
          >
            <span className="admin-avatar" aria-hidden="true">AD</span>
            <span className="admin-profile-copy">
              <strong>Administrator</strong>
              <span>Site manager</span>
            </span>
            <span className="admin-profile-chevron" aria-hidden="true">⌄</span>
          </button>
          {profileOpen && (
            <div className="admin-profile-menu" role="menu">
              <div className="admin-profile-menu-heading">
                <strong>Administrator</strong>
                <span>Manage your workspace</span>
              </div>
              <Link
                href={`/${adminPath}/settings`}
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <span aria-hidden="true">⚙️</span> Settings
              </Link>
              <Link href="/" target="_blank" rel="noopener noreferrer" role="menuitem">
                <span aria-hidden="true">🌐</span> View public site
              </Link>
              <button
                type="button"
                role="menuitem"
                className="admin-profile-signout"
                onClick={handleSignOut}
              >
                <span aria-hidden="true">↪</span> Sign out
              </button>
            </div>
          )}
        </div>

        <ThemeToggle className="admin-theme-toggle" />

        <button
          type="button"
          className="menu-btn admin-menu-toggle"
          aria-label={open ? 'Close admin menu' : 'Open admin menu'}
          aria-expanded={open}
          aria-controls="admin-navigation-drawer"
          onClick={() => setOpen((current) => !current)}
        >
          <span className={`menu-lines ${open ? 'open' : ''}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

      <aside className="admin-side">
        <SidebarContent siteName={siteName} siteLogo={siteLogo} adminPath={adminPath} />
      </aside>

      <div
        className={`admin-drawer ${open ? 'open' : ''}`}
        id="admin-navigation-drawer"
        aria-hidden={!open}
      >
        <button
          type="button"
          className="backdrop"
          aria-label="Close admin menu"
          onClick={() => setOpen(false)}
        />
        <aside className="panel" inert={!open}>
          <SidebarContent
            siteName={siteName}
            siteLogo={siteLogo}
            adminPath={adminPath}
            onNavigate={() => setOpen(false)}
          />
          <div className="admin-drawer-signout">
            <button type="button" className="admin-link danger" onClick={handleSignOut}>
              <span className="ico" aria-hidden="true">↪</span>
              <span>Sign out</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
