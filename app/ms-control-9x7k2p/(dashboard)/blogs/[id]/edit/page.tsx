import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { getBlogById } from '@/lib/db';
import { updateBlog } from '@/lib/actions/blogs';
import BlogForm from '@/components/BlogForm';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;

  const [blog, gamesRes] = await Promise.all([
    getBlogById(id),
    supabaseAdmin.from('games').select('id, name').order('name'),
  ]);

  const games = gamesRes.data || [];

  if (!blog) notFound();

  const action = updateBlog.bind(null, id);

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/ms-control-9x7k2p/blogs"
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