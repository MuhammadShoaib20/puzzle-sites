-- Update privacy page content to remove Microsoft Clarity references
UPDATE public.pages
SET content = '<p>Last updated: October 12, 2026</p><h2>Information we collect</h2><p>We use Google Analytics and Google AdSense which may collect anonymous usage data.</p><h2>Cookies</h2><p>We use cookies to improve user experience and serve relevant ads. Users can manage cookie preferences through our consent banner.</p><h2>Third-party services</h2><p>Our site embeds YouTube videos. YouTube may collect data as per their privacy policy.</p><h2>Contact</h2><p>For privacy questions, email contact@yoursite.com.</p>',
    updated_at = now()
WHERE slug = 'privacy';
