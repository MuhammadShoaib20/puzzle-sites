import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATH = process.env.ADMIN_SECRET_PATH || 'ms-control-9x7k2p';

export default auth((req: NextRequest & { auth: unknown }) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // /{ADMIN_PATH}/login public hai
  if (pathname === `/${ADMIN_PATH}/login`) {
    if (isLoggedIn) {
      // Agar already logged in hai to dashboard pe bhej do
      return NextResponse.redirect(new URL(`/${ADMIN_PATH}/dashboard`, req.url));
    }
    return NextResponse.next();
  }

  // Baaki saare /{ADMIN_PATH}/* routes protected hain
  if (pathname.startsWith(`/${ADMIN_PATH}`)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/${ADMIN_PATH}/login`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};