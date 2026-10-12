'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { makeSlug } from '@/lib/utils';
import type { Page } from '@/types';

type ActionResult = { error?: string } | void;
type Props = {
  action: (formData: FormData) => Promise<ActionResult>;
  page?: Page;
  submitLabel?: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? 'Saving…' : label}
    </button>
  );
}

export default function PageForm({
  action,
  page,
  submitLabel = 'Save Page',
}: Props) {
  const [slug, setSlug] = useState(page?.slug || '');
  const slugWasEdited = useRef(Boolean(page?.slug));
  const [error, formAction] = useActionState(
    async (_error: string | null, formData: FormData) => {
      const result = await action(formData);
      return result?.error || null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">Page details</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="page-title" className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="page-title"
              type="text"
              name="title"
              defaultValue={page?.title || ''}
              required
              onChange={(event) => {
                if (!slugWasEdited.current) setSlug(makeSlug(event.target.value));
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="page-slug" className="block text-sm font-medium mb-1">
              Slug
            </label>
            <input
              id="page-slug"
              type="text"
              name="slug"
              value={slug}
              onChange={(event) => {
                slugWasEdited.current = true;
                setSlug(makeSlug(event.target.value));
              }}
              required
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="page-content" className="block text-sm font-medium mb-1">
            Content (HTML)
          </label>
          <textarea
            id="page-content"
            name="content"
            defaultValue={page?.content || ''}
            rows={18}
            placeholder="<h2>About this page</h2><p>...</p>"
            className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">SEO</h2>
        <div>
          <label htmlFor="page-meta-title" className="block text-sm font-medium mb-1">
            Meta title
          </label>
          <input
            id="page-meta-title"
            name="meta_title"
            defaultValue={page?.meta_title || ''}
            maxLength={70}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="page-meta-description" className="block text-sm font-medium mb-1">
            Meta description
          </label>
          <textarea
            id="page-meta-description"
            name="meta_description"
            defaultValue={page?.meta_description || ''}
            rows={3}
            maxLength={160}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold border-b pb-3">Visibility and order</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={page?.is_published ?? true}
            className="w-4 h-4"
          />
          <span className="font-medium">Published</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="show_in_footer"
            defaultChecked={page?.show_in_footer ?? false}
            className="w-4 h-4"
          />
          <span className="font-medium">Show in footer</span>
        </label>
        <div>
          <label htmlFor="page-sort-order" className="block text-sm font-medium mb-1">
            Footer sort order
          </label>
          <input
            id="page-sort-order"
            type="number"
            name="sort_order"
            defaultValue={page?.sort_order ?? 0}
            step={1}
            className="w-full max-w-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/ms-control-9x7k2p/pages" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
