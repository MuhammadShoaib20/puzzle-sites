import Link from 'next/link';
import type { Blog, Game } from '@/types';

type ActionResult = { error?: string } | void;

type Props = {
  action: (formData: FormData) => Promise<ActionResult> | ActionResult;
  blog?: Blog;
  games?: Pick<Game, 'id' | 'name'>[];
  submitLabel?: string;
};

export default function BlogForm({
  action,
  blog,
  games = [],
  submitLabel = 'Save',
}: Props) {
  return (
    <form action={action as never} className="space-y-6">
      {/* ================= BASIC INFO ================= */}
      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">Basic Info</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              defaultValue={blog?.title || ''}
              required
              placeholder="How to Beat Fish Jam Level 25"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Slug <span className="text-gray-400">— auto-generate</span>
            </label>
            <input
              type="text"
              name="slug"
              defaultValue={blog?.slug || ''}
              placeholder="how-to-beat-fish-jam-level-25"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Related Game (Optional)
          </label>
          <select
            name="game_id"
            defaultValue={blog?.game_id || ''}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— None —</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cover Image URL</label>
          <input
            type="url"
            name="cover_image"
            defaultValue={blog?.cover_image || ''}
            placeholder="https://..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">Content</h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            Content (HTML allowed)
          </label>
          <textarea
            name="content"
            defaultValue={blog?.content || ''}
            rows={15}
            placeholder="<h2>Introduction</h2><p>...</p>"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            HTML use karo — headings, paragraphs, lists, links.
          </p>
        </div>
      </div>

      {/* ================= SEO ================= */}
      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">SEO</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Meta Title</label>
          <input
            type="text"
            name="meta_title"
            defaultValue={blog?.meta_title || ''}
            maxLength={70}
            placeholder="How to Beat Fish Jam Level 25 — Guide"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Meta Description</label>
          <textarea
            name="meta_description"
            defaultValue={blog?.meta_description || ''}
            rows={2}
            maxLength={160}
            placeholder="Complete guide to beat Fish Jam Level 25..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Keywords <span className="text-gray-400">— comma separated</span>
          </label>
          <input
            type="text"
            name="keywords"
            defaultValue={blog?.keywords?.join(', ') || ''}
            placeholder="fish jam level 25, fish jam guide, puzzle tips"
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
            defaultChecked={blog?.published ?? true}
            className="w-4 h-4"
          />
          <span className="font-medium">Published</span>
          <span className="text-sm text-gray-500">
            — Agar unchecked, public site pe nahi dikhega
          </span>
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
          href="/admin/blogs"
          className="btn btn-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}