'use client';

import { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Blog, Game } from '@/types';
import ImageUpload from './ImageUpload';
import { useToast } from './Toast';

type ActionResult = { success: boolean; error?: string; fieldErrors?: { title?: string; slug?: string; content?: string }; data?: unknown };

type Props = {
  action: (formData: FormData) => Promise<ActionResult>;
  blog?: Blog;
  games?: Pick<Game, 'id' | 'name'>[];
  submitLabel?: string;
  redirectPath?: string;
};

export default function BlogForm({
  action,
  blog,
  games = [],
  submitLabel = 'Save',
  redirectPath = '/ms-control-9x7k2p/blogs',
}: Props) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastProcessedState, setLastProcessedState] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: { success: boolean; error?: string; fieldErrors?: Record<string, string> } | null, formData: FormData) => {
      const result = await action(formData);
      return result ?? null;
    },
    null
  );

  // Handle successful submission
  useEffect(() => {
    if (!state) return;

    const stateKey = JSON.stringify(state);
    if (stateKey === lastProcessedState) return;

    setLastProcessedState(stateKey);

    if (state.success) {
      success('Blog saved successfully!');
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 500);
    } else if (state.error) {
      toastError(state.error);
      // Set field errors if present
      if (state.fieldErrors) {
        setFieldErrors(state.fieldErrors);
      }
    }
  }, [state, lastProcessedState, success, toastError, router, redirectPath]);

  // beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Track unsaved changes
  const markAsChanged = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };

  return (
    <form
      action={formAction as never}
      className="space-y-6"
      onChange={markAsChanged}
    >
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
            {fieldErrors.title && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
            )}
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
            {fieldErrors.slug && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.slug}</p>
            )}
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

        <ImageUpload
          name="cover_image"
          defaultValue={blog?.cover_image || ''}
          folder="blogs"
          label="Cover Image"
          aspect="video"
        />
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
          {fieldErrors.content && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.content}</p>
          )}
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
          disabled={isPending}
          className="btn btn-primary"
        >
          {isPending ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
        <Link
          href={redirectPath}
          className="btn btn-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}