import Link from 'next/link';
import BulkImportLevelsJsonForm from '@/components/BulkImportLevelsJsonForm';

export default function BulkImportLevelsJsonPage() {
  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <Link href="/ms-control-9x7k2p/games" className="admin-back">
            ← Back to games
          </Link>
          <h1 className="admin-title mt-2">Bulk Import Levels (JSON)</h1>
          <p className="admin-sub">
            Create or update levels for one or more games from a JSON array.
          </p>
        </div>
      </div>
      <BulkImportLevelsJsonForm />
    </div>
  );
}
