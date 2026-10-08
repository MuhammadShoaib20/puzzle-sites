import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

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

        // ⚠️ supabaseAdmin use karo (RLS bypass) — admin_users me koi public policy nahi hai
        const { data, error } = await supabaseAdmin
          .from('admin_users')
          .select('*')
          .eq('email', credentials.email as string)
          .single();

        if (error || !data) {
          console.log('Auth error:', error?.message);
          return null;
        }

        const user = data as {
          id: string;
          email: string;
          name: string | null;
          password_hash: string;
          role: string;
        };

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || 'Admin',
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
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