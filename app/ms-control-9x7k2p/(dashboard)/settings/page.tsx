import { supabaseAdmin } from '@/lib/supabase';
import { updateSettings } from '@/lib/actions/settings';
import SettingsForm from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

async function getSettings() {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('*')
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

      <SettingsForm action={updateSettings} settings={settings} />
    </div>
  );
}
