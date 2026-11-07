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
    "level_number": 1,
    "youtube_url": "https://youtu.be/VIDEO_ID",
    "description": "A concise solution.",
    "walkthrough": "- **[0:04] Step 1:** Make the first move.",
    "tips": "Avoid blocking the center."
  }
]`}
            className="w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-sm text-gray-600">
          Provide a JSON array with <code>game_slug</code>, <code>level_number</code>, and{' '}
          <code>youtube_url</code>. Description, walkthrough, and tips are optional. Existing
          levels are updated without changing their title or screenshots; new levels are published.
          Maximum 1,000 levels per import.
        </p>
      </div>

      <SubmitButton />

      {state && !state.success && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state?.success && (
        <div className="card border border-green-200 bg-green-50 p-5" role="status">
          <p className="font-bold text-green-800">
            Successfully updated {state.updated} and created {state.created} levels.
          </p>
        </div>
      )}
    </form>
  );
}
