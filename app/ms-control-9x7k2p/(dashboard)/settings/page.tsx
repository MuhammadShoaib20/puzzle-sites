import { supabaseAdmin } from '@/lib/supabase';
import { updateSettings } from '@/lib/actions/settings';
import SettingsForm from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

async function getSettings() {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('site_name, site_url, site_logo, site_description, adsense_header, adsense_in_article, adsense_sidebar, adsense_footer, youtube_button_text, switch_youtube_enabled, google_analytics_id, ahrefs_data_key, google_search_console, social_links')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('getSettings error:', error.message);
    return null;
  }

  return data;
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="admin-page animate-fade-in-up" style={{ maxWidth: 900 }}>
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Site settings</h1>
          <p className="admin-sub">Manage site-wide configuration, AdSense codes and social links.</p>
        </div>
      </div>

      {!settings && (
        <div className="admin-alert">
          ⚠️ Settings row not found in the database. Run this in the Supabase SQL Editor:
          <code>INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;</code>
        </div>
      )}

      <SettingsForm
        action={updateSettings}
        settings={settings}
        initialSiteUrl={
          process.env.NEXT_PUBLIC_SITE_URL ||
          (settings?.site_url && settings.site_url !== 'https://yoursite.com'
            ? settings.site_url
            : 'https://puzzlewalkthroughs.com')
        }
      />
    </div>
  );
}
