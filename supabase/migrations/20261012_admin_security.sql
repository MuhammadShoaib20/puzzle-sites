-- Add security columns to admin_users table
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS password_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_password_change timestamptz,
ADD COLUMN IF NOT EXISTS last_login_ip text,
ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Create admin_login_attempts table
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text NOT NULL,
  user_agent text,
  success boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_email_time
  ON public.admin_login_attempts (email, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip_time
  ON public.admin_login_attempts (ip_address, attempted_at DESC);

-- Enable RLS for admin_login_attempts
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can access login attempts
DROP POLICY IF EXISTS "Service role full access to admin_login_attempts" ON public.admin_login_attempts;
CREATE POLICY "Service role full access to admin_login_attempts"
  ON public.admin_login_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_email_time
  ON public.admin_activity_log (admin_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action_time
  ON public.admin_activity_log (action, created_at DESC);

-- Enable RLS for admin_activity_log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access activity log
DROP POLICY IF EXISTS "Service role full access to admin_activity_log" ON public.admin_activity_log;
CREATE POLICY "Service role full access to admin_activity_log"
  ON public.admin_activity_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Clean up old login attempts (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_login_attempts
  WHERE attempted_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Clean up old activity logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_activity_log
  WHERE created_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;
