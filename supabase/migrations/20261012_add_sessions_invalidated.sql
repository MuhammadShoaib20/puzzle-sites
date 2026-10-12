-- Add sessions_invalidated_at column to admin_users
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS sessions_invalidated_at timestamptz;
