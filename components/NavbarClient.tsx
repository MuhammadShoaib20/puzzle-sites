'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="site-nav">
      <div className="container-page">
        <div className="nav-inner">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            {siteLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={siteLogo} alt={siteName} className="h-9 w-auto max-w-44 object-contain" />
            ) : (
              <>
                <span className="brand-mark" aria-hidden="true">🧩</span>
                <span className="hidden sm:inline">{siteName}</span>
                <span className="sm:hidden">Puzzle</span>
              </>
            )}
          </Link>

          <div className="hidden md:block flex-1 max-w-md mx-auto">
            <NavbarSearch />
          </div>

          <nav className="hidden md:flex items-center gap-1 ml-auto" aria-label="Main">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="menu-btn md:hidden ml-auto"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`menu-lines ${open ? 'open' : ''}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        {/* Mobile / tablet panel */}
        <div className={`mobile-panel md:hidden ${open ? 'open' : ''}`}>
          <div className="mobile-panel-inner" inert={!open}>
            <div className="pb-4">
              <NavbarSearch onDone={() => setOpen(false)} />
            </div>
            <nav className="mobile-links" aria-label="Mobile">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
