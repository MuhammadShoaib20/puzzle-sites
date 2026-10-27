'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavbarSearch from './NavbarSearch';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

type Props = {
  siteName: string;
  siteLogo: string | null;
};

export default function NavbarClient({ siteName, siteLogo }: Props) {
  const pathname = usePathname();

  // The menu is "open for" a specific path, so it closes by itself on every
  // route change (no effect needed).
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const closeMenu = () => setOpenFor(null);
  const toggleMenu = () => setOpenFor(open ? null : pathname);

  // Close with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenFor(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="site-nav">
      <div className="container-page">
        <div className="nv-bar">
          <Link href="/" className="nv-brand" onClick={closeMenu}>
            {siteLogo ? (
              <span className="nv-logo">
                <Image
                  src={siteLogo}
                  alt=""
                  width={40}
                  height={40}
                  sizes="40px"
                  className="nv-logo-img"
                  preload
                />
              </span>
            ) : (
              <span className="nv-mark" aria-hidden="true">
                🧩
              </span>
            )}
            <span className="nv-name">{siteName}</span>
          </Link>

          {/* Desktop search */}
          <div className="nv-search">
            <NavbarSearch />
          </div>

          {/* Desktop links */}
          <nav className="nv-links" aria-label="Main">
            {LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`nv-link ${active ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Menu button (phones + tablets) */}
          <button
            type="button"
            className="menu-btn nv-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="nv-mobile-panel"
            onClick={toggleMenu}
          >
            <span className={`menu-lines ${open ? 'open' : ''}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        {/* Mobile / tablet panel */}
        <div id="nv-mobile-panel" className={`mobile-panel nv-panel ${open ? 'open' : ''}`}>
          <div className="mobile-panel-inner" inert={!open}>
            <div className="nv-panel-body">
              <NavbarSearch onDone={closeMenu} />
              <nav className="nv-mobile-links" aria-label="Mobile">
                {LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={active ? 'page' : undefined}
                      className={`nv-mlink ${active ? 'active' : ''}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}