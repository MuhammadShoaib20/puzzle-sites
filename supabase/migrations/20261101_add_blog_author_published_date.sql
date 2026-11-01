ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS published_date timestamptz;

UPDATE public.blogs
SET author = 'Muhammad Shoaib'
WHERE author IS NULL;

UPDATE public.blogs
SET published_date = created_at
WHERE published_date IS NULL;

ALTER TABLE public.blogs
  ALTER COLUMN author SET DEFAULT 'Muhammad Shoaib',
  ALTER COLUMN author SET NOT NULL,
  ALTER COLUMN published_date SET DEFAULT now(),
  ALTER COLUMN published_date SET NOT NULL;
