import type { Metadata } from 'next';
import { getAllBlogs } from '@/lib/db';
import BlogCard from '@/components/BlogCard';
import EmptyState from '@/components/EmptyState';

export const metadata: Metadata = {
  title: 'Blog — Puzzle Game Guides & Tips',
  description: 'Read the latest puzzle game walkthroughs, tips and tricks.',
};

export const revalidate = 60;

export default async function BlogPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="container-page py-10 md:py-16 animate-fade-in-up">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="page-title">Blog</h1>
        <p className="page-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Guides, tips and strategies for every puzzle game.
        </p>
      </header>

      {blogs.length === 0 ? (
        <EmptyState
          emoji="📝"
          title="No blog posts yet"
          text="Add blogs from the admin panel to see them here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
