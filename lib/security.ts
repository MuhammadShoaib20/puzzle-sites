import { supabaseAdmin } from './supabase';

export interface LoginAttempt {
  email: string;
  ip_address: string;
  user_agent?: string;
  success: boolean;
}

export async function logLoginAttempt(attempt: LoginAttempt) {
  try {
    await supabaseAdmin.from('admin_login_attempts').insert({
      email: attempt.email,
      ip_address: attempt.ip_address,
      user_agent: attempt.user_agent || null,
      success: attempt.success,
    });
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

export async function checkRateLimit(email: string, ip_address: string): Promise<{ allowed: boolean; error?: string }> {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: emailAttempts, error: emailError } = await supabaseAdmin
      .from('admin_login_attempts')
      .select('id')
      .eq('email', email)
      .eq('success', false)
      .gte('attempted_at', fifteenMinutesAgo);

    if (emailError) {
      console.error('Failed to check email rate limit:', emailError);
      return { allowed: true };
    }

    if (emailAttempts && emailAttempts.length >= 5) {
      return { allowed: false, error: 'Too many failed attempts. Try again in 15 minutes.' };
    }

    const { data: ipAttempts, error: ipError } = await supabaseAdmin
      .from('admin_login_attempts')
      .select('id')
      .eq('ip_address', ip_address)
      .eq('success', false)
      .gte('attempted_at', fifteenMinutesAgo);

    if (ipError) {
      console.error('Failed to check IP rate limit:', ipError);
      return { allowed: true };
    }

    if (ipAttempts && ipAttempts.length >= 5) {
      return { allowed: false, error: 'Too many failed attempts. Try again in 15 minutes.' };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    return { allowed: true };
  }
}

export interface ActivityLog {
  admin_email: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, unknown>;
}

export async function logActivity(log: ActivityLog) {
  try {
    await supabaseAdmin.from('admin_activity_log').insert({
      admin_email: log.admin_email,
      action: log.action,
      ip_address: log.ip_address || null,
      user_agent: log.user_agent || null,
      details: log.details || null,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function getRecentLoginAttempts(limit = 20) {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_login_attempts')
      .select('*')
      .order('attempted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get login attempts:', error);
    return [];
  }
}

export async function getRecentActivityLogs(limit = 50) {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return [];
  }
}

export async function updateAdminLoginInfo(email: string, ip: string) {
  try {
    await supabaseAdmin
      .from('admin_users')
      .update({
        last_login_ip: ip,
        last_login_at: new Date().toISOString(),
      })
      .eq('email', email);
  } catch (error) {
    console.error('Failed to update admin login info:', error);
  }
}
