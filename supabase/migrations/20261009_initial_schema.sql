-- Initial Puzzle Site schema migration, captured 2026-10-09.
-- Apply only to a new/empty Supabase project. Existing projects should apply
-- only migrations that have not yet been applied, not replay this baseline.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  cover_image text,
  short_description text,
  full_description text,
  walkthrough_intro text,
  youtube_trailer_url text,
  youtube_channel_url text,
  custom_buttons jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta_title text,
  meta_description text,
  keywords text[],
  operating_system text NOT NULL DEFAULT 'Android, iOS',
  total_levels integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  level_number integer NOT NULL,
  title text,
  slug text,
  youtube_url text NOT NULL,
  youtube_id text NOT NULL,
  description text,
  walkthrough text,
  tips text,
  meta_title text,
  meta_description text,
  views integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT levels_game_level_unique UNIQUE (game_id, level_number)
);

CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  cover_image text,
  meta_title text,
  meta_description text,
  keywords text[],
  views integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  icon text,
  position integer NOT NULL DEFAULT 0,
  new_tab boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name text NOT NULL DEFAULT 'Puzzle Walkthroughs',
  site_url text NOT NULL DEFAULT 'https://yoursite.com',
  site_logo text,
  site_description text,
  adsense_header text,
  adsense_in_article text,
  adsense_sidebar text,
  adsense_footer text,
  adsense_ads_txt text,
  youtube_button_text text NOT NULL DEFAULT 'Watch on YouTube',
  switch_youtube_enabled boolean NOT NULL DEFAULT true,
  google_analytics_id text,
  google_search_console text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_games_published_created ON public.games (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games (category_id);
CREATE INDEX IF NOT EXISTS idx_levels_game_number ON public.levels (game_id, level_number);
CREATE INDEX IF NOT EXISTS idx_levels_published_created ON public.levels (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_published_created ON public.blogs (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_game ON public.blogs (game_id);
CREATE INDEX IF NOT EXISTS idx_game_links_game_position ON public.game_links (game_id, position);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);

INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read games" ON public.games;
CREATE POLICY "Public read games" ON public.games FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Public read levels" ON public.levels;
CREATE POLICY "Public read levels" ON public.levels FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Public read blogs" ON public.blogs;
CREATE POLICY "Public read blogs" ON public.blogs FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Public read links" ON public.game_links;
CREATE POLICY "Public read links" ON public.game_links FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
-- No anon/authenticated policy is created for admin_users.
