import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}