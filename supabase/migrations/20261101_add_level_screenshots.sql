ALTER TABLE public.levels
  ADD COLUMN IF NOT EXISTS screenshots jsonb NOT NULL DEFAULT '[]'::jsonb;
