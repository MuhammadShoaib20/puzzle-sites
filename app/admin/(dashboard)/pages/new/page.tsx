import PageForm from '@/components/PageForm';
import { createPage } from '@/lib/actions/pages';

export default function NewPagePage() {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Add New Page</h1>
      <p className="text-gray-600 mb-8">Create a page for your site.</p>
      <PageForm action={createPage} submitLabel="Create Page" />
    </div>
  );
}
