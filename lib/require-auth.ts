import { auth } from '@/lib/auth';

export async function requireAuth() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== 'admin') {
    throw new Error('Unauthorized: admin access required');
  }
  return session;
}