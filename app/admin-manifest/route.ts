import { getAdminPath } from '@/lib/admin-path';

export function GET() {
  const adminBase = `/${getAdminPath()}/`;
  const manifest = {
    name: 'PW Admin',
    short_name: 'PW Admin',
    description: 'Manage Puzzle Walkthroughs',
    start_url: `${adminBase}dashboard`,
    scope: adminBase,
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#0369A1',
    icons: [
      {
        src: '/pw-admin-icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
