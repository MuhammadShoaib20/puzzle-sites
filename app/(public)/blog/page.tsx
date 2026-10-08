import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getAllBlogs } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Blog — Puzzle Game Guides & Tips',
  description: 'Read the latest puzzle game walkthroughs, tips and tricks.',
};

export const revalidate = 60;

export default async function BlogPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8">📝 Blog</h1>

      {blogs.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-10 text-center text-gray-500">
          Abhi koi blog publish nahi hua.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="border rounded-xl overflow-hidden hover:shadow-lg transition group"
            >
              {blog.cover_image && (
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <Image
                    src={blog.cover_image}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-semibold text-lg line-clamp-2 mb-2">
                  {blog.title}
                </h2>
                {blog.meta_description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {blog.meta_description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}