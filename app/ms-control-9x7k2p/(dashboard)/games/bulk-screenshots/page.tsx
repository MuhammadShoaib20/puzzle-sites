import Link from 'next/link';
import BulkLevelScreenshotsForm from '@/components/BulkLevelScreenshotsForm';

export const dynamic = 'force-dynamic';

export default function BulkLevelScreenshotsPage() {
  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Full Bulk Level Updater</h1>
          <p className="admin-sub">
            Update level text, SEO fields, screenshots, and step overviews from one CSV.
          </p>
        </div>
        <Link href="/ms-control-9x7k2p/games" className="btn btn-secondary btn-sm">
          Back to games
        </Link>
      </div>

      <BulkLevelScreenshotsForm />
    </div>
  );
}
