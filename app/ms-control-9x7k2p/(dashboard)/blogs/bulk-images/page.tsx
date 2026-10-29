import Link from 'next/link';
import BulkBlogImagesForm from '@/components/BulkBlogImagesForm';

export const dynamic = 'force-dynamic';

export default function BulkBlogImagesPage() {
  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Bulk Image Upload</h1>
          <p className="admin-sub">Upload cover images for existing blogs by matching their slugs.</p>
        </div>
        <Link href="/ms-control-9x7k2p/blogs" className="btn btn-secondary btn-sm">
          Back to blogs
        </Link>
      </div>

      <BulkBlogImagesForm />
    </div>
  );
}
