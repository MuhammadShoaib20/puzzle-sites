import BulkBlogImportForm from '@/components/BulkBlogImportForm';
import Link from 'next/link';

export default function ImportBlogsPage() {
  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Import blogs from CSV</h1>
          <p className="admin-sub">Upload a CSV file to create or update multiple blogs.</p>
        </div>
        <Link href="/ms-control-9x7k2p/blogs" className="btn btn-secondary btn-sm">
          Back to blogs
        </Link>
      </div>

      <BulkBlogImportForm />
    </div>
  );
}
