'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Game } from '@/types';

type FAQItem = { q: string; a: string };
type ButtonItem = { label: string; url: string; newTab: boolean };

type Props = {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  game?: Game;
  submitLabel?: string;
};

export default function GameForm({ action, game, submitLabel = 'Save' }: Props) {
  const [faq, setFaq] = useState<FAQItem[]>(
    Array.isArray(game?.faq) ? game.faq : []
  );
  const [buttons, setButtons] = useState<ButtonItem[]>(
    Array.isArray(game?.custom_buttons)
      ? game.custom_buttons.map((button) => ({
          label: button.label,
          url: button.url,
          newTab: button.newTab !== false,
        }))
      : []
  );

  return (
    <form action={action as never} className="space-y-6">
      <input type="hidden" name="faq_json" value={JSON.stringify(faq)} />
      <input
        type="hidden"
        name="custom_buttons_json"
        value={JSON.stringify(buttons)}
      />

      <div className="card p-6 space-y-5">
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
            Operating System <span className="text-gray-400">— for SEO schema</span>
          </label>
          <input
            type="text"
            name="operating_system"
            defaultValue={game?.operating_system || 'Android, iOS'}
            maxLength={120}
            placeholder="Android, iOS, Web"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: “Android, iOS”, “Web Browser”, “PC, Android”
          </p>
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

      <div className="card p-6 space-y-5">
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

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold">❓ FAQ</h2>
          <button
            type="button"
            onClick={() => setFaq((items) => [...items, { q: '', a: '' }])}
            className="text-sm btn btn-primary px-3 py-1.5"
          >
            + Add FAQ
          </button>
        </div>

        {faq.length === 0 && (
          <p className="text-sm text-gray-500">
            Koi FAQ nahi. “Add FAQ” click karke add karo.
          </p>
        )}

        {faq.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">
                FAQ #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => setFaq((items) => items.filter((_, i) => i !== index))}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              value={item.q}
              onChange={(event) =>
                setFaq((items) => items.map((entry, i) =>
                  i === index ? { ...entry, q: event.target.value } : entry
                ))
              }
              placeholder="Question"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={item.a}
              onChange={(event) =>
                setFaq((items) => items.map((entry, i) =>
                  i === index ? { ...entry, a: event.target.value } : entry
                ))
              }
              placeholder="Answer"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold">🔗 Custom Buttons</h2>
          <button
            type="button"
            onClick={() => setButtons((items) => [...items, { label: '', url: '', newTab: true }])}
            className="text-sm btn btn-primary px-3 py-1.5"
          >
            + Add Button
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Game page par dikhne wale links (Download, Discord, etc.).
        </p>

        {buttons.length === 0 && (
          <p className="text-sm text-gray-500">Koi custom button nahi.</p>
        )}

        {buttons.map((button, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">
                Button #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => setButtons((items) => items.filter((_, i) => i !== index))}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              value={button.label}
              onChange={(event) =>
                setButtons((items) => items.map((entry, i) =>
                  i === index ? { ...entry, label: event.target.value } : entry
                ))
              }
              placeholder="Button label"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={button.url}
              onChange={(event) =>
                setButtons((items) => items.map((entry, i) =>
                  i === index ? { ...entry, url: event.target.value } : entry
                ))
              }
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={button.newTab}
                onChange={(event) =>
                  setButtons((items) => items.map((entry, i) =>
                    i === index ? { ...entry, newTab: event.target.checked } : entry
                  ))
                }
                className="w-4 h-4"
              />
              <span>Open in new tab</span>
            </label>
          </div>
        ))}
      </div>

      <div className="card p-6 space-y-5">
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
          className="btn btn-primary"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/games"
          className="btn btn-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}