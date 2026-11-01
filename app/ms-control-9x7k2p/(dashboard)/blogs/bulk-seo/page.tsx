import Link from 'next/link';
import BulkBlogSeoForm from '@/components/BulkBlogSeoForm';

export const dynamic = 'force-dynamic';

export default function BulkBlogSeoPage() {
  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Bulk SEO Meta Updater</h1>
          <p className="admin-sub">Update titles and SEO metadata for existing blogs from a CSV.</p>
        </div>
        <Link href="/ms-control-9x7k2p/blogs" className="btn btn-secondary btn-sm">
          Back to blogs
        </Link>
      </div>

      <BulkBlogSeoForm />
    </div>
  );
}
