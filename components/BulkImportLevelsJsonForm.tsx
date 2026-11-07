'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  bulkImportLevelsJson,
  type BulkJsonImportResult,
} from '@/lib/actions/levels';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? 'Importing…' : 'Import Levels'}
    </button>
  );
}

export default function BulkImportLevelsJsonForm() {
  const [state, formAction] = useActionState(
    bulkImportLevelsJson,
    null as BulkJsonImportResult | null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="card p-6 space-y-4">
        <div>
          <label htmlFor="levels-json" className="block text-sm font-medium mb-1">
            Levels JSON
          </label>
          <textarea
            id="levels-json"
            name="levels_json"
            required
            rows={20}
            spellCheck={false}
            placeholder={`[
  {
    "game_slug": "tricky-hacks",
    "level_number": 1
  },
  {
    "game_slug": "tricky-hacks",
    "level_number": 2,
    "youtube_url": "https://youtu.be/VIDEO_ID",
    "description": "A concise solution.",
    "walkthrough": "- **[0:04] Step 1:** Make the first move.",
    "tips": "Avoid blocking the center.",
    "meta_title": "Tricky Hacks Level 2",
    "meta_description": "A concise search description.",
    "published": true
  }
]`}
            className="w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-sm text-gray-600">
          Only <code>game_slug</code> and <code>level_number</code> are required. On existing
          levels, omitted, blank, null, and placeholder fields are preserved; invalid optional
          values are skipped with a warning. A valid <code>youtube_url</code> is required to create
          a new level because the database does not allow it to be empty. New levels default to
          published. Existing slugs and screenshots are never changed. Maximum 1,000 levels per
          import.
        </p>
      </div>

      <SubmitButton />

      {state && !state.success && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state?.success && (
        <div className="card border border-green-200 bg-green-50 p-5 space-y-3" role="status">
          <p className="font-bold text-green-800">
            Updated: {state.updated} levels | Created: {state.created} levels | Warnings/Skipped
            fields: {state.warningCount}
          </p>
          {state.warnings.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
              {state.warnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>{warning}</li>
              ))}
            </ul>
          )}
          {state.warningCount > state.warnings.length && (
            <p className="text-sm text-amber-800">
              {state.warningCount - state.warnings.length} additional warning(s) not shown.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
