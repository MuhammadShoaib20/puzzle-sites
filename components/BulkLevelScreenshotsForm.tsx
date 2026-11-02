'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import {
  bulkUpdateLevelScreenshots,
  type BulkLevelScreenshotsResult,
} from '@/lib/actions/bulk-level-screenshots';
import { useToast } from '@/components/Toast';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? 'Updating screenshots…' : 'Upload & Update Screenshots'}
    </button>
  );
}

export default function BulkLevelScreenshotsForm() {
  const { success, error: toastError } = useToast();
  const processedState = useRef<BulkLevelScreenshotsResult | null>(null);
  const [state, formAction] = useActionState(
    async (
      _previousState: BulkLevelScreenshotsResult | null,
      formData: FormData
    ): Promise<BulkLevelScreenshotsResult> => {
      try {
        return await bulkUpdateLevelScreenshots(formData);
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
      toastError(state.error || 'Failed to update level screenshots.');
      return;
    }

    const skipped = state.skippedItems || [];
    if (state.updatedCount) {
      success(`Updated screenshots for ${state.updatedCount} level(s).`);
    }
    if (skipped.length > 0) {
      const missingImages = skipped.filter((item) => item.message.includes('was not selected'));
      const summary =
        missingImages.length > 0
          ? `${missingImages.length} selected image(s) were missing: ${missingImages
              .slice(0, 3)
              .map((item) => item.message.match(/Image "([^"]+)"/)?.[1] || 'unknown')
              .join(', ')}${missingImages.length > 3 ? ', …' : ''}.`
          : `${skipped.length} row(s)/image(s) were skipped; see the report below.`;
      toastError(summary);
    }
    if (!state.updatedCount && skipped.length === 0) {
      toastError('No level screenshots were updated.');
    }
  }, [state, success, toastError]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="card p-6 space-y-5">
        <div>
          <label htmlFor="level-screenshots-csv" className="block text-sm font-medium mb-1">
            CSV file
          </label>
          <input
            id="level-screenshots-csv"
            type="file"
            name="csv"
            accept=".csv,text/csv"
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="level-screenshot-images" className="block text-sm font-medium mb-1">
            Screenshot images
          </label>
          <input
            id="level-screenshot-images"
            type="file"
            name="images"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p className="font-medium text-gray-800">CSV columns (in any order):</p>
          <p className="break-all font-mono text-xs">
            game_slug, level_number, image_1_name, image_1_overview, image_2_name,
            image_2_overview, image_3_name, image_3_overview
          </p>
          <p>
            Image names must exactly match the selected filenames, including the extension.
            Supported formats: JPG, PNG, and WebP. Each image must be under 5 MB; total upload
            must be under 49 MB.
          </p>
          <p className="font-mono text-xs">
            Example: sand-blocks,113,step-1.webp,Move the blue block,step-2.webp,Clear the path,,
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
        <div className="card p-6 space-y-3" role="status">
          <p className="font-bold text-green-800">
            Updated screenshots for {state.updatedCount || 0} level(s).
          </p>
          {(state.skippedItems?.length || 0) > 0 && (
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Skipped rows or images:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {state.skippedItems?.map((item, index) => (
                  <li key={`${item.rowNumber}-${index}`}>
                    {item.rowNumber > 0 ? `CSV row ${item.rowNumber}: ` : ''}
                    {item.message}
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
