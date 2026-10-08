import { supabaseAdmin } from '@/lib/supabase';
import { createBlog } from '@/lib/actions/blogs';
import BlogForm from '@/components/BlogForm';

export const dynamic = 'force-dynamic';

async function getGamesList() {
  const { data } = await supabaseAdmin
    .from('games')
    .select('id, name')
    .order('name', { ascending: true });
  return data || [];
}

export default async function NewBlogPage() {
  const games = await getGamesList();

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Add New Blog</h1>
      <p className="text-gray-600 mb-8">
        Write a new blog post or guide.
      </p>

      <BlogForm action={createBlog} games={games} submitLabel="Create Blog" />
    </div>
  );
}