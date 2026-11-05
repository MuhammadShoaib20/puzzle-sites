import { auth } from '@/lib/auth';
import { CANONICAL_SITE_URL } from '@/lib/seo';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATH = process.env.ADMIN_SECRET_PATH || 'ms-control-9x7k2p';
const CANONICAL_HOST = new URL(CANONICAL_SITE_URL).host;
const WWW_HOST = `www.${CANONICAL_HOST}`;

export default auth((req: NextRequest & { auth: unknown }) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const forwardedHost = req.headers.get('x-forwarded-host');
  const requestHost = (forwardedHost || req.headers.get('host') || '').split(',')[0].trim();
  const host = requestHost.toLowerCase().replace(/:\d+$/, '');
  const forwardedProtocol = req.headers.get('x-forwarded-proto')?.split(',')[0].trim();
  const protocol = forwardedProtocol || req.nextUrl.protocol.replace(/:$/, '');
  const lowercasePath = pathname.toLowerCase();
  const normalizedPath = lowercasePath === '/' ? '/' : lowercasePath.replace(/\/+$/, '');
  const redirectPath = normalizedPath === '/privacy-policy' ? '/privacy' : normalizedPath;

  if (
    (host === CANONICAL_HOST || host === WWW_HOST) &&
    (host !== CANONICAL_HOST || protocol !== 'https' || pathname !== redirectPath)
  ) {
    const destination = new URL(redirectPath, CANONICAL_SITE_URL);
    destination.search = req.nextUrl.search;
    return NextResponse.redirect(destination, 301);
  }

  // /{ADMIN_PATH}/login public hai
  if (pathname === `/${ADMIN_PATH}/login`) {
    if (isLoggedIn) {
      // Agar already logged in hai to dashboard pe bhej do
      const url = req.nextUrl.clone();
      url.pathname = `/${ADMIN_PATH}/dashboard`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Baaki saare /{ADMIN_PATH}/* routes protected hain
  if (pathname.startsWith(`/${ADMIN_PATH}`)) {
    if (!isLoggedIn) {
      const url = req.nextUrl.clone();
      url.pathname = `/${ADMIN_PATH}/login`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Yahan humne 'xml' aur 'txt' ko bhi exclude list mein add kar diya hai
    '/((?!api/|_next/|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|woff|woff2|xml|txt)$).*)',
  ],
};