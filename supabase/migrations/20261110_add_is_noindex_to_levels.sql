ALTER TABLE public.levels
  ADD COLUMN IF NOT EXISTS is_noindex boolean NOT NULL DEFAULT false;
