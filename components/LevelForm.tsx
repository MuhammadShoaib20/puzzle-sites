import Link from 'next/link';
import type { Level } from '@/types';

type ActionResult = { error?: string } | void;

type Props = {
  action: (formData: FormData) => Promise<ActionResult> | ActionResult;
  level?: Level;
  submitLabel?: string;
};

export default function LevelForm({ action, level, submitLabel = 'Save' }: Props) {
  return (
    <form action={action as never} className="space-y-6">
      {/* ================= BASIC INFO ================= */}
      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">Level Info</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Level Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="level_number"
              defaultValue={level?.level_number || ''}
              required
              min="1"
              disabled={!!level}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {level && (
              <p className="text-xs text-gray-500 mt-1">
                Level number change nahi kar sakte.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              defaultValue={level?.title || ''}
              placeholder="Fish Jam Level 1"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            YouTube URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            name="youtube_url"
            defaultValue={level?.youtube_url || ''}
            required
            placeholder="https://youtu.be/..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            YouTube video ka link — video ID auto-extract hogi.
          </p>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">Content</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={level?.description || ''}
            rows={2}
            placeholder="Fish Jam Level 1 walkthrough video guide."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Walkthrough (HTML allowed)
          </label>
          <textarea
            name="walkthrough"
            defaultValue={level?.walkthrough || ''}
            rows={6}
            placeholder="<p>Step 1: Match blue fish...</p>"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            SEO ke liye 300+ words likhna best hai.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Pro Tips (HTML allowed)
          </label>
          <textarea
            name="tips"
            defaultValue={level?.tips || ''}
            rows={3}
            placeholder="<p><strong>Pro tip:</strong> Plan 2 moves ahead.</p>"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      </div>

      {/* ================= SEO ================= */}
      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">SEO (Optional)</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Meta Title</label>
          <input
            type="text"
            name="meta_title"
            defaultValue={level?.meta_title || ''}
            maxLength={70}
            placeholder="Fish Jam Level 1 Walkthrough & Solution"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Meta Description</label>
          <textarea
            name="meta_description"
            defaultValue={level?.meta_description || ''}
            rows={2}
            maxLength={160}
            placeholder="Complete Fish Jam Level 1 walkthrough..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ================= PUBLISH ================= */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={level?.published ?? true}
            className="w-4 h-4"
          />
          <span className="font-medium">Published</span>
        </label>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="btn btn-primary"
        >
          {submitLabel}
        </button>
        <Link
          href={level ? `../..` : `..`}
          className="btn btn-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}