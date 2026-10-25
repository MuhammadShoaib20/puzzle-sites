import type { NextConfig } from 'next';
import path from 'path';

const ADMIN_PATH = process.env.ADMIN_SECRET_PATH || 'ms-control-9x7k2p';

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: 'security',
  },
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [70, 75, 85],
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.ahrefs.com https://www.youtube.com https://s.ytimg.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.adtrafficquality.google https://adservice.google.com https://*.googleadservices.com https://*.doubleclick.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob: https://*.googlesyndication.com https://*.googleadservices.com https://*.doubleclick.net",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.ahrefs.com https://*.googlesyndication.com https://*.googleadservices.com https://*.doubleclick.net https://*.adtrafficquality.google",
              "frame-src https://www.youtube.com https://www.google.com https://*.googlesyndication.com https://*.adtrafficquality.google https://*.doubleclick.net https://*.googleadservices.com",
              "media-src 'self' https://*.ytimg.com",
            ].join('; '),
          },
        ],
      },
      {
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: `/${ADMIN_PATH}/:path*`,
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
    ];
  },
};

export default nextConfig;