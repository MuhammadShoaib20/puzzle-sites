'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/require-auth';
import bcrypt from 'bcryptjs';
import { signOut } from '@/lib/auth';
import { headers } from 'next/headers';

async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');

    if (forwarded) {
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

export async function changeAdminPassword(formData: FormData) {
  const session = await requireAuth();
  const email = session.user?.email;

  if (!email) {
    return { error: 'User not found.' };
  }

  const currentPassword = formData.get('current_password') as string;
  const newPassword = formData.get('new_password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' };
  }

  // Validate password strength
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial || newPassword.length < 12) {
    return { error: 'Password must be at least 12 characters with uppercase, lowercase, number, and special character.' };
  }

  // Get current user data
  const { data: user, error: userError } = await supabaseAdmin
    .from('admin_users')
    .select('password_hash, password_history')
    .eq('email', email)
    .single();

  if (userError || !user) {
    return { error: 'User not found.' };
  }

  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return { error: 'Current password is incorrect.' };
  }

  // Check password history (last 3 passwords)
  const passwordHistory = (user.password_history as string[]) || [];
  for (const oldHash of passwordHistory.slice(0, 3)) {
    const isOldPassword = await bcrypt.compare(newPassword, oldHash);
    if (isOldPassword) {
      return { error: 'Cannot reuse one of your last 3 passwords.' };
    }
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  const newPasswordHistory = [newPasswordHash, ...passwordHistory].slice(0, 3);
  const { error: updateError } = await supabaseAdmin
    .from('admin_users')
    .update({
      password_hash: newPasswordHash,
      password_history: newPasswordHistory,
      last_password_change: new Date().toISOString(),
    })
    .eq('email', email);

  if (updateError) {
    return { error: updateError.message };
  }

  // Log activity
  await logActivity(email, 'Password changed');

  revalidatePath('/ms-control-9x7k2p/security');
  return { success: true };
}

export async function invalidateAllSessions() {
  const session = await requireAuth();
  const email = session.user?.email;

  if (!email) {
    return { error: 'User not found.' };
  }

  // Update sessions_invalidated_at timestamp
  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({
      sessions_invalidated_at: new Date().toISOString(),
    })
    .eq('email', email);

  if (error) {
    return { error: error.message };
  }

  // Log activity
  await logActivity(email, 'Invalidated all sessions');

  return { success: true };
}

export async function logLogout() {
  const session = await requireAuth();
  const email = session.user?.email;

  if (!email) {
    return { error: 'User not found.' };
  }

  // Log activity
  await logActivity(email, 'Logout');

  return { success: true };
}
