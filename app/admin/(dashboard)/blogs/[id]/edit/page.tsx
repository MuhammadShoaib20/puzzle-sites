import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { updateBlog } from '@/lib/actions/blogs';
import BlogForm from '@/components/BlogForm';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;

  const [blogRes, gamesRes] = await Promise.all([
    supabaseAdmin.from('blogs').select('*').eq('id', id).single(),
    supabaseAdmin.from('games').select('id, name').order('name'),
  ]);

  const blog = blogRes.data;
  const games = gamesRes.data || [];

  if (!blog) notFound();

  const action = updateBlog.bind(null, id);

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/admin/blogs"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Blogs
      </Link>
      <h1 className="text-3xl font-bold mt-2 mb-8">Edit Blog</h1>

      <BlogForm
        action={action}
        blog={blog}
        games={games}
        submitLabel="Update Blog"
      />
    </div>
  );
}