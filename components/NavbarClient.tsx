'use client';

import Link from 'next/link';
import Image from 'next/image';
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
              <span className="brand-logo-frame">
                <Image
                  src={siteLogo}
                  alt=""
                  width={40}
                  height={40}
                  className="brand-logo"
                  priority
                  unoptimized
                />
              </span>
            ) : (
              <span className="brand-mark" aria-hidden="true">🧩</span>
            )}
            <span className="brand-name">{siteName}</span>
          </Link>

          <div className="hidden lg:block flex-1 max-w-sm mx-auto">
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
