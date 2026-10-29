'use client';

import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { bulkImportBlogs } from '@/lib/actions/blogs';
import { useToast } from './Toast';

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

  async function handleImport(formData: FormData) {
    const result = await bulkImportBlogs(formData);

    if (!result.success) {
      toastError(result.error || 'Failed to import blogs.');
      return;
    }

    success(`${result.importedCount} Blogs imported successfully!`);
    setTimeout(() => {
      router.push('/ms-control-9x7k2p/blogs');
      router.refresh();
    }, 500);
  }

  return (
    <form action={handleImport} className="space-y-6">
      <div className="card p-6 space-y-5">
        <div>
          <label htmlFor="blog-csv" className="block text-sm font-medium mb-1">
            CSV file
          </label>
          <input
            id="blog-csv"
            type="file"
            name="file"
            accept=".csv"
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
            with commas. Set published to true or false. Cover images are left blank.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
        <p className="text-sm text-gray-500">Maximum file size: 4.9 MB</p>
      </div>
    </form>
  );
}
