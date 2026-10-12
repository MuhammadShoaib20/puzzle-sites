import Link from 'next/link';
import Image from 'next/image';
import type { Category, Settings } from '@/types';
import { getFooterPages } from '@/lib/db';
import { openCookieBanner } from '@/components/CookieConsentBanner';

type Props = {
  settings: Settings | null;
  categories: Category[];
};

function isSafeExternalUrl(value?: string): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export default async function Footer({ settings, categories }: Props) {
  const pages = await getFooterPages();
  const siteName = settings?.site_name || 'PuzzleWalkthroughs';
  const siteLogo = settings?.site_logo || null;
  const siteDescription =
    settings?.site_description ||
    'Complete video walkthroughs for all puzzle games.';
  const social = settings?.social_links || {};
  const socialLinks = [
    { key: 'youtube', label: 'YouTube' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'twitter', label: 'Twitter / X' },
    { key: 'instagram', label: 'Instagram' },
  ].filter(({ key }) => isSafeExternalUrl(social[key]));
  const visibleCategories = categories.slice(0, 6);

  return (
    <footer className="site-footer">
      <div className="container-page">
        <div className={`footer-grid ${visibleCategories.length === 0 ? 'no-cat' : ''}`}>
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="footer-brand">
              {siteLogo ? (
                <span className="footer-logo-frame">
                  <Image
                    src={siteLogo}
                    alt={siteName}
                    width={48}
                    height={48}
                    className="footer-logo"
                    unoptimized
                  />
                </span>
              ) : (
                <span className="brand-mark" aria-hidden="true">🧩</span>
              )}
              <span className="footer-brand-name">{siteName}</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">{siteDescription}</p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {socialLinks.map(({ key, label }) => (
                  <a
                    key={key}
                    href={social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-pill"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <div className="footer-title">Quick links</div>
            <div className="footer-links">
              <Link href="/" className="footer-link">Home</Link>
              <Link href="/blog" className="footer-link">Blog</Link>
            </div>
          </div>

          {pages.length > 0 && (
            <div>
              <div className="footer-title">Pages</div>
              <div className="footer-links">
                {pages.map((page) => (
                  <Link key={page.id} href={`/${page.slug}`} className="footer-link">
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {visibleCategories.length > 0 && (
            <div>
              <div className="footer-title">Categories</div>
              <div className="footer-links">
                {visibleCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="footer-link"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Follow (only if no pills shown in brand block, keep a hint for admin) */}
          <div className="footer-cta">
            <div className="footer-title">Stuck on a level?</div>
            <p className="text-sm leading-relaxed mb-4">
              Pick a game and open the exact level you need.
            </p>
            <Link href="/#all-games" className="btn btn-primary btn-sm">
              Browse games
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>© {new Date().getFullYear()} {siteName}. All rights reserved.</span>
            <button
              type="button"
              onClick={openCookieBanner}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
