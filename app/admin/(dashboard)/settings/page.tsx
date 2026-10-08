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
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
      <p className="text-gray-600 mb-8">
        Manage site-wide configuration, AdSense codes, and social links.
      </p>

      {!settings && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          ⚠️ Settings row nahi mili DB me. Supabase SQL Editor me yeh run karo:
          <code className="block mt-2 bg-yellow-100 p-2 rounded">
            INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
          </code>
        </div>
      )}

      <SettingsForm action={updateSettings} settings={settings} />
    </div>
  );
}