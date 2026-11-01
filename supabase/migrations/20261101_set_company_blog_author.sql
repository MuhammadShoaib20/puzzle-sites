ALTER TABLE public.blogs
  ALTER COLUMN author SET DEFAULT 'MS Digital System';

UPDATE public.blogs
SET author = 'MS Digital System',
    published_date = COALESCE(published_date, created_at, now())
WHERE slug = 'rotate-rings-game-guide';

SELECT slug, author, published_date
FROM public.blogs
WHERE slug = 'rotate-rings-game-guide';
