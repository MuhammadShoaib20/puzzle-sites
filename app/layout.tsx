import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
import Script from 'next/script';
import ConsentAnalytics from '@/components/ConsentAnalytics';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import { getSettings } from '@/lib/db';
import './globals.css';

const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  preload: false,
});

const display = Sora({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  preload: true,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Puzzle Walkthroughs — All Levels Guide',
    template: '%s | Puzzle Walkthroughs',
  },
  description:
    'Complete walkthroughs and video guides for all puzzle games. Level by level solutions with tips and tricks.',
  keywords: [
    'puzzle walkthrough',
    'puzzle games',
    'game guide',
    'level solutions',
    'puzzle tips',
  ],
  authors: [{ name: 'Puzzle Walkthroughs' }],
  creator: 'Puzzle Walkthroughs',
  publisher: 'Puzzle Walkthroughs',
  other: {
    'google-adsense-account': 'ca-pub-2631095859749439',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Puzzle Walkthroughs',
    title: 'Puzzle Walkthroughs — All Levels Guide',
    description:
      'Complete walkthroughs and video guides for all puzzle games.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Puzzle Walkthroughs',
    description:
      'Complete walkthroughs and video guides for all puzzle games.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: '#0EA5E9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const ahrefsDataKey = settings?.ahrefs_data_key?.trim();

  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <head>
        {ahrefsDataKey && (
          <script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key={ahrefsDataKey}
            async
          />
        )}
      </head>
      <body>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2631095859749439"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <ConsentAnalytics gaId={settings?.google_analytics_id || null} />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
