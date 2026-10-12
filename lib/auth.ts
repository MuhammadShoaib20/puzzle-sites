import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';
import { checkRateLimit, logLoginAttempt, updateAdminLoginInfo } from './security';
import { sendLoginNotification } from './email';
import { headers } from 'next/headers';

const ADMIN_PATH = process.env.ADMIN_SECRET_PATH || 'ms-control-9x7k2p';
const SITE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com';

async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');

    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwarded.split(',')[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

async function logActivity(email: string, action: string) {
  const ip = await getClientIP();
  const userAgent = (await headers()).get('user-agent') || 'unknown';

  await supabaseAdmin.from('admin_activity_log').insert({
    admin_email: email,
    action,
    ip_address: ip,
    user_agent: userAgent,
    created_at: new Date().toISOString(),
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Get IP from server headers
        const ip = await getClientIP();
        const userAgent = (credentials as any).userAgent || 'unknown';

        // Check rate limit
        const rateLimitCheck = await checkRateLimit(email, ip);
        if (!rateLimitCheck.allowed) {
          await logLoginAttempt({ email, ip_address: ip, user_agent: userAgent, success: false });
          throw new Error(rateLimitCheck.error);
        }

        // ⚠️ supabaseAdmin use karo (RLS bypass) — admin_users me koi public policy nahi hai
        const { data, error } = await supabaseAdmin
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !data) {
          await logLoginAttempt({ email, ip_address: ip, user_agent: userAgent, success: false });
          console.log('Auth error:', error?.message);
          return null;
        }

        const user = data as {
          id: string;
          email: string;
          name: string | null;
          password_hash: string;
          role: string;
          sessions_invalidated_at?: string | null;
        };

        // Check if sessions were invalidated
        if (user.sessions_invalidated_at) {
          const invalidationTime = new Date(user.sessions_invalidated_at).getTime();
          const currentTime = Date.now();
          // If invalidation was less than 5 minutes ago, reject
          if (currentTime - invalidationTime < 5 * 60 * 1000) {
            return null;
          }
        }

        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
          await logLoginAttempt({ email, ip_address: ip, user_agent: userAgent, success: false });
          return null;
        }

        // Log successful attempt
        await logLoginAttempt({ email, ip_address: ip, user_agent: userAgent, success: true });
        await updateAdminLoginInfo(email, ip);

        // Log activity
        await logActivity(email, 'Successful login');

        // Send email notification via Resend API
        await sendLoginNotification({
          email,
          ip,
          userAgent,
          timestamp: new Date(),
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name || 'Admin',
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
    updateAge: 5 * 60, // Update session every 5 minutes
  },
  pages: { signIn: `/${ADMIN_PATH}/login` },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as { role?: string }).role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = (token as { role?: string }).role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});