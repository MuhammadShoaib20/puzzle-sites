'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  bulkUpdateBlogSEO,
  type BulkSeoUpdateResult,
} from '@/lib/actions/blogs';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? 'Updating…' : 'Upload & Update SEO'}
    </button>
  );
}

export default function BulkBlogSeoForm() {
  const [state, formAction] = useActionState(
    async (
      _previousState: BulkSeoUpdateResult | null,
      formData: FormData
    ): Promise<BulkSeoUpdateResult> => {
      try {
        return await bulkUpdateBlogSEO(formData);
      } catch {
        return { success: false, error: 'Upload failed. Please try again.' };
      }
    },
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="card p-6 space-y-4">
        <div>
          <label htmlFor="blog-seo-csv" className="block text-sm font-medium mb-1">
            SEO CSV file
          </label>
          <input
            id="blog-seo-csv"
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-800">Required columns, in any order:</p>
          <p className="mt-1 break-words font-mono text-xs">
            slug, title, meta_title, meta_description
          </p>
          <p className="mt-2">
            Each slug must match an existing blog. Leave meta_title or meta_description blank to
            clear that field. Blog content will not be changed. Maximum file size: 4.9 MB.
          </p>
        </div>
      </div>

      <SubmitButton />

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      {state?.success && (
        <div className="card border border-green-200 bg-green-50 p-6 space-y-3" role="status">
          <p className="font-bold text-green-800">
            Successfully updated SEO for {state.updatedCount || 0} blog(s).
          </p>
          {(state.notFoundSlugs?.length || 0) > 0 && (
            <div className="text-sm text-amber-800">
              <p className="font-semibold">
                These slugs did not match existing blogs and were skipped:
              </p>
              <ul className="mt-1 list-disc pl-5">
                {state.notFoundSlugs?.map((slug) => <li key={slug}>{slug}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
