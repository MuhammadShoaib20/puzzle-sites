import Link from 'next/link';
import Image from 'next/image';
import type { Blog } from '@/types';
import { formatDate } from '@/lib/utils';

export default function BlogCard({
  blog,
  preload = false,
}: {
  blog: Blog;
  preload?: boolean;
}) {
  return (
    <Link href={`/blog/${blog.slug}`} prefetch={false} className="card card-hover blog-card">
      <div className="blog-thumb">
        {blog.cover_image ? (
          <Image
            src={blog.cover_image}
            alt={blog.title + " cover image"}
            title={blog.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw"
            quality={70}
            {...(preload ? { preload: true } : { loading: 'lazy' })}
          />
        ) : (
          <span aria-hidden="true">📝</span>
        )}
        <span className="badge badge-white blog-badge">Guide</span>
      </div>
      <div className="blog-body">
        <h3 className="blog-title">{blog.title}</h3>
        {blog.meta_description ? (
          <p className="blog-excerpt">{blog.meta_description}</p>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        <div className="blog-meta">
          <span>{formatDate(blog.created_at)}</span>
          <span className="blog-read-cta">Read guide</span>
        </div>
      </div>
    </Link>
  );
}
