import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import DeletePageButton from '@/components/DeletePageButton';
import type { Page } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const { data, error } = await supabaseAdmin
    .from('pages')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true });

  if (error) throw new Error(`Could not load pages: ${error.message}`);
  const pages = (data || []) as Page[];

  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Pages</h1>
          <p className="admin-sub">{pages.length} total pages</p>
        </div>
        <Link href="/admin/pages/new" className="btn btn-primary btn-sm">
          + Add page
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📄</div>
          <p className="font-bold mb-4">No pages yet</p>
          <Link href="/admin/pages/new" className="btn btn-primary btn-sm">
            + Create first page
          </Link>
        </div>
      ) : (
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Footer</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className="name">{page.title}</td>
                  <td className="mono">{page.slug}</td>
                  <td>{page.show_in_footer ? page.sort_order : '—'}</td>
                  <td>
                    {page.is_published ? (
                      <span className="pill pill-green">Published</span>
                    ) : (
                      <span className="pill pill-gray">Draft</span>
                    )}
                  </td>
                  <td className="right">
                    <span className="admin-actions">
                      <Link href={`/admin/pages/${page.id}`} className="act act-edit">
                        Edit
                      </Link>
                      <DeletePageButton id={page.id} title={page.title} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
