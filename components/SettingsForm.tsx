import type { Settings } from '@/types';

type ActionResult = { error?: string } | void;

type Props = {
  action: (formData: FormData) => Promise<ActionResult> | ActionResult;
  settings: Settings | null;
};

export default function SettingsForm({ action, settings }: Props) {
  return (
    <form action={action as never} className="space-y-6">
      {/* ================= SITE INFO ================= */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">Site Info</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">Site Name</label>
            <input
              type="text"
              name="site_name"
              defaultValue={settings?.site_name || 'Puzzle Walkthroughs'}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Site URL</label>
            <input
              type="url"
              name="site_url"
              defaultValue={settings?.site_url || ''}
              placeholder="https://yoursite.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Site Logo URL</label>
          <input
            type="url"
            name="site_logo"
            defaultValue={settings?.site_logo || ''}
            placeholder="https://..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Site Description</label>
          <textarea
            name="site_description"
            defaultValue={settings?.site_description || ''}
            rows={2}
            maxLength={160}
            placeholder="Complete walkthroughs for all puzzle games."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ================= YOUTUBE BUTTON ================= */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">YouTube</h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            YouTube Button Text
          </label>
          <input
            type="text"
            name="youtube_button_text"
            defaultValue={settings?.youtube_button_text || 'Watch on YouTube'}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="switch_youtube_enabled"
            defaultChecked={settings?.switch_youtube_enabled ?? true}
            className="w-4 h-4"
          />
<span className="font-medium">Show &quot;Switch to YouTube&quot; button</span>        </label>
      </div>

      {/* ================= ADSENSE ================= */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">
          💰 AdSense Codes
        </h2>
        <p className="text-xs text-gray-500 -mt-3">
          Har field me AdSense ka <code>&lt;script&gt;</code> ya{" "}
          <code>&lt;ins&gt;</code> code paste karo. Khali chhodo agar ad nahi chahiye us slot me.
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">Header Ad</label>
          <textarea
            name="adsense_header"
            defaultValue={settings?.adsense_header || ''}
            rows={4}
            placeholder="<ins class='adsbygoogle' ...></ins>"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            In-Article Ad (Level pages ke beech)
          </label>
          <textarea
            name="adsense_in_article"
            defaultValue={settings?.adsense_in_article || ''}
            rows={4}
            placeholder="<ins class='adsbygoogle' ...></ins>"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sidebar Ad</label>
          <textarea
            name="adsense_sidebar"
            defaultValue={settings?.adsense_sidebar || ''}
            rows={4}
            placeholder="<ins class='adsbygoogle' ...></ins>"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Footer Ad</label>
          <textarea
            name="adsense_footer"
            defaultValue={settings?.adsense_footer || ''}
            rows={4}
            placeholder="<ins class='adsbygoogle' ...></ins>"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
          />
        </div>
      </div>

      {/* ================= ANALYTICS ================= */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">📊 Analytics</h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            Google Analytics ID
          </label>
          <input
            type="text"
            name="google_analytics_id"
            defaultValue={settings?.google_analytics_id || ''}
            placeholder="G-XXXXXXXXXX"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Google Search Console Verification Code
          </label>
          <input
            type="text"
            name="google_search_console"
            defaultValue={settings?.google_search_console || ''}
            placeholder="xxxxxxxxxxxxx"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      </div>

      {/* ================= SOCIAL LINKS ================= */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">🔗 Social Links</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">YouTube</label>
            <input
              type="url"
              name="social_youtube"
              defaultValue={settings?.social_links?.youtube || ''}
              placeholder="https://youtube.com/@..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Facebook</label>
            <input
              type="url"
              name="social_facebook"
              defaultValue={settings?.social_links?.facebook || ''}
              placeholder="https://facebook.com/..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Twitter / X</label>
            <input
              type="url"
              name="social_twitter"
              defaultValue={settings?.social_links?.twitter || ''}
              placeholder="https://x.com/..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Instagram</label>
            <input
              type="url"
              name="social_instagram"
              defaultValue={settings?.social_links?.instagram || ''}
              placeholder="https://instagram.com/..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ================= SAVE ================= */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          💾 Save Settings
        </button>
      </div>
    </form>
  );
}