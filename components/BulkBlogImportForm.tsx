'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { bulkImportBlogs } from '@/lib/actions/blogs';
import { useToast } from './Toast';

type ImportState = {
  success: boolean;
  importedCount?: number;
  error?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? 'Importing…' : 'Upload & Import'}
    </button>
  );
}

export default function BulkBlogImportForm() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const processedState = useRef<ImportState | null>(null);

  const [state, formAction] = useActionState(
    async (_previousState: ImportState | null, formData: FormData): Promise<ImportState> => {
      try {
        return await bulkImportBlogs(formData);
      } catch {
        return { success: false, error: 'Upload failed. Please try again.' };
      }
    },
    null
  );

  useEffect(() => {
    if (!state || processedState.current === state) return;
    processedState.current = state;

    if (!state.success) {
      toastError(state.error || 'Failed to import blogs.');
      return;
    }

    success(`${state.importedCount} Blogs imported successfully!`);
    setTimeout(() => {
      router.push('/ms-control-9x7k2p/blogs');
      router.refresh();
    }, 500);
  }, [router, state, success, toastError]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="card p-6 space-y-5">
        <div>
          <label htmlFor="blog-files" className="block text-sm font-medium mb-1">
            CSV and cover images
          </label>
          <input
            id="blog-files"
            type="file"
            name="files"
            accept=".csv,image/webp,image/jpeg,image/png"
            multiple
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-800">Required columns, in any order:</p>
          <p className="mt-1 break-words font-mono text-xs">
            title, slug, related_game, content, meta_title, meta_description, keywords, published
          </p>
          <p className="mt-2">
            Leave related_game blank when a post is not associated with a game. Separate keywords
            with commas. Set published to true or false. Select exactly one CSV and optionally
            multiple cover images. Each image filename must match its blog slug, for example
            <span className="font-mono"> sand-blocks-level-113.webp</span>. Images must be JPG,
            PNG, or WebP and no larger than 5 MB each.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
        <p className="text-sm text-gray-500">Maximum total upload size: 49 MB</p>
      </div>

      {state && !state.success && (
        <p role="alert" className="text-sm text-red-600">
          {state.error || 'Failed to import blogs. Please try again.'}
        </p>
      )}
    </form>
  );
}
