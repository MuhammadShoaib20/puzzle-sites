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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blogs</h1>
          <p className="text-gray-600 mt-1">{blogs.length} total posts</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + Add New Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">Abhi koi blog nahi hai.</p>
          <Link
            href="/admin/blogs/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            + Create First Blog
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{blog.title}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    {blog.slug}
                  </td>
                  <td className="px-4 py-3 text-sm">{blog.views || 0}</td>
                  <td className="px-4 py-3">
                    {blog.published ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Published
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/blogs/${blog.id}/edit`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteBlogButton id={blog.id} title={blog.title} />
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