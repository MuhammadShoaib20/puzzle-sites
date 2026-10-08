import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import DeleteBlogButton from '@/components/DeleteBlogButton';

export const dynamic = 'force-dynamic';

async function getBlogs() {
  const { data } = await supabaseAdmin
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function AdminBlogsPage() {
  const blogs = await getBlogs();

  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Blogs</h1>
          <p className="admin-sub">{blogs.length} total posts</p>
        </div>
        <Link href="/admin/blogs/new" className="btn btn-primary btn-sm">
          + Add blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📝</div>
          <p className="font-bold mb-4">No blogs yet</p>
          <Link href="/admin/blogs/new" className="btn btn-primary btn-sm">
            + Create first blog
          </Link>
        </div>
      ) : (
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Views</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="name">{blog.title}</td>
                  <td className="mono">{blog.slug}</td>
                  <td>{blog.views || 0}</td>
                  <td>
                    {blog.published ? (
                      <span className="pill pill-green">Published</span>
                    ) : (
                      <span className="pill pill-gray">Draft</span>
                    )}
                  </td>
                  <td className="right">
                    <span className="admin-actions">
                      <Link href={`/admin/blogs/${blog.id}/edit`} className="act act-edit">
                        Edit
                      </Link>
                      <DeleteBlogButton id={blog.id} title={blog.title} />
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
