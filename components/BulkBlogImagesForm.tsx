'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  bulkUploadBlogImages,
  type BulkBlogImagesResult,
} from '@/lib/actions/blog-images';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? 'Uploading…' : 'Upload Images'}
    </button>
  );
}

export default function BulkBlogImagesForm() {
  const [state, formAction] = useActionState(
    async (
      _previousState: BulkBlogImagesResult | null,
      formData: FormData
    ): Promise<BulkBlogImagesResult> => {
      try {
        return await bulkUploadBlogImages(formData);
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
          <label htmlFor="blog-images" className="block text-sm font-medium mb-1">
            Blog cover images
          </label>
          <input
            id="blog-images"
            type="file"
            name="images"
            accept=".webp,.jpg,.png,image/webp,image/jpeg,image/png"
            multiple
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <p className="text-sm text-gray-600">
          Each filename must exactly match a blog slug, for example{' '}
          <span className="font-mono">sand-blocks-level-113.webp</span>. JPG, PNG, and WebP files
          are supported. Each image must be under 5 MB; total upload must be under 49 MB.
        </p>
      </div>

      <SubmitButton />

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      {state?.success && (
        <div className="card border border-green-200 bg-green-50 p-6 space-y-4" role="status">
          <div className="text-green-800">
            <h2 className="font-bold">
              Successfully updated {state.updatedSlugs?.length || 0} blogs
            </h2>
            {(state.updatedSlugs?.length || 0) > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {state.updatedSlugs?.map((slug) => <li key={slug}>{slug}</li>)}
              </ul>
            )}
          </div>

          {(state.skippedImages?.length || 0) > 0 && (
            <div className="border-t border-green-200 pt-4 text-amber-800">
              <h3 className="font-semibold">
                Skipped {state.skippedImages?.length} images (Slug mismatch or upload failure)
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {state.skippedImages?.map((image) => (
                  <li key={`${image.fileName}-${image.reason}`}>
                    <span className="font-mono">{image.fileName}</span>: {image.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
