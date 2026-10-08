import Link from 'next/link';
import Image from 'next/image';
import type { Category, Settings } from '@/types';

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

export default function Footer({ settings, categories }: Props) {
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
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.9rem',
                color: '#fff',
              }}
            >
              {siteLogo ? (
                <Image
                  src={siteLogo}
                  alt={siteName}
                  width={180}
                  height={60}
                  style={{
                    height: 42,
                    width: 'auto',
                    maxWidth: 180,
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                  }}
                  unoptimized
                />
              ) : (
                <>
                  <span className="brand-mark" aria-hidden="true">🧩</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display), sans-serif',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {siteName}
                  </span>
                </>
              )}
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
              <Link href="/about" className="footer-link">About</Link>
              <Link href="/contact" className="footer-link">Contact</Link>
            </div>
          </div>

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

          {/* Legal */}
          <div>
            <div className="footer-title">Legal</div>
            <div className="footer-links">
              <Link href="/privacy-policy" className="footer-link">Privacy policy</Link>
              <Link href="/terms" className="footer-link">Terms of service</Link>
            </div>
          </div>

          {/* Follow (only if no pills shown in brand block, keep a hint for admin) */}
          <div>
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
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
