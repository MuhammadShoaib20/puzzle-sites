CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  meta_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT false,
  show_in_footer boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_footer_order
  ON public.pages (is_published, show_in_footer, sort_order);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published pages" ON public.pages;
CREATE POLICY "Public read published pages"
  ON public.pages
  FOR SELECT
  USING (is_published = true);

GRANT SELECT ON public.pages TO anon, authenticated;
GRANT ALL ON public.pages TO service_role;

INSERT INTO public.pages (
  slug,
  title,
  content,
  meta_title,
  meta_description,
  is_published,
  show_in_footer,
  sort_order
)
VALUES
  (
    'about',
    'About us',
    '<p>Welcome to Puzzle Walkthroughs — your one-stop destination for complete video guides on puzzle games.</p><p>We provide level-by-level walkthroughs, tips, and tricks to help you beat even the toughest puzzles.</p>',
    'About Us',
    'Learn about Puzzle Walkthroughs — your source for complete puzzle game guides.',
    true,
    true,
    1
  ),
  (
    'contact',
    'Contact us',
    '<p>Have questions, feedback, or business inquiries? Reach out to us:</p><p><strong>Email:</strong> contact@yoursite.com</p>',
    'Contact Us',
    'Get in touch with Puzzle Walkthroughs.',
    true,
    true,
    2
  ),
  (
    'privacy',
    'Privacy policy',
    '<p>Last updated: October 12, 2026</p><h2>Information we collect</h2><p>We use Google Analytics and Google AdSense which may collect anonymous usage data.</p><h2>Cookies</h2><p>We use cookies to improve user experience and serve relevant ads.</p><h2>Third-party services</h2><p>Our site embeds YouTube videos. YouTube may collect data as per their privacy policy.</p><h2>Contact</h2><p>For privacy questions, email contact@yoursite.com.</p>',
    'Privacy Policy',
    'Our privacy policy explains how we handle your data.',
    true,
    true,
    3
  ),
  (
    'terms',
    'Terms of service',
    '<p>By using this site, you agree to these terms.</p><h2>Use of content</h2><p>All content is for informational purposes only.</p><h2>External links</h2><p>We embed YouTube videos and link to external sites. We are not responsible for their content.</p>',
    'Terms of Service',
    'Terms of service for using Puzzle Walkthroughs.',
    true,
    true,
    4
  )
ON CONFLICT (slug) DO NOTHING;
