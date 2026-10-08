'use client';

import Link from 'next/link';
import type { Game } from '@/types';

type Props = {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  game?: Game;
  submitLabel?: string;
};

export default function GameForm({ action, game, submitLabel = 'Save' }: Props) {
  return (
    <form action={action as never} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">Basic Info</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Game Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              defaultValue={game?.name || ''}
              required
              placeholder="Fish Jam"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Slug (URL) <span className="text-gray-400">— auto-generate</span>
            </label>
            <input
              type="text"
              name="slug"
              defaultValue={game?.slug || ''}
              placeholder="fish-jam"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cover Image URL</label>
          <input
            type="url"
            name="cover_image"
            defaultValue={game?.cover_image || ''}
            placeholder="https://..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Short Description <span className="text-gray-400">— 150 chars max</span>
          </label>
          <textarea
            name="short_description"
            defaultValue={game?.short_description || ''}
            rows={2}
            maxLength={160}
            placeholder="Fun puzzle game where you match fish to clear levels."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Full Description (HTML allowed)
          </label>
          <textarea
            name="full_description"
            defaultValue={game?.full_description || ''}
            rows={6}
            placeholder="<p>Fish Jam is a puzzle game...</p>"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Walkthrough Intro (HTML allowed)
          </label>
          <textarea
            name="walkthrough_intro"
            defaultValue={game?.walkthrough_intro || ''}
            rows={4}
            placeholder="<p>Complete walkthrough...</p>"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">YouTube</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">Trailer URL</label>
            <input
              type="url"
              name="youtube_trailer_url"
              defaultValue={game?.youtube_trailer_url || ''}
              placeholder="https://youtu.be/..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Channel URL</label>
            <input
              type="url"
              name="youtube_channel_url"
              defaultValue={game?.youtube_channel_url || ''}
              placeholder="https://youtube.com/@yourchannel"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">SEO</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Meta Title</label>
          <input
            type="text"
            name="meta_title"
            defaultValue={game?.meta_title || ''}
            maxLength={70}
            placeholder="Fish Jam All Levels Walkthrough & Guide"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Meta Description</label>
          <textarea
            name="meta_description"
            defaultValue={game?.meta_description || ''}
            rows={2}
            maxLength={160}
            placeholder="Complete Fish Jam walkthrough. Solve all 50 levels with video guides."
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
            defaultValue={game?.keywords?.join(', ') || ''}
            placeholder="fish jam, fish jam walkthrough, fish jam levels"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={game?.published ?? true}
            className="w-4 h-4"
          />
          <span className="font-medium">Published</span>
          <span className="text-sm text-gray-500">
            — Agar unchecked, public site pe nahi dikhega
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/games"
          className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}