CREATE TABLE IF NOT EXISTS public.bing_credentials (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  api_key_encrypted text NOT NULL,
  site_url text NOT NULL,
  status text NOT NULL DEFAULT 'verification_failed'
    CHECK (status IN ('connected', 'verification_failed')),
  last_submitted_at timestamptz,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bing_credentials ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.bing_credentials TO service_role;