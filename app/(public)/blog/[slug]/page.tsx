import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getBlogBySlug } from '@/lib/db';
import { formatDate } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return {};

  return {
    title: blog.meta_title || blog.title,
    description: blog.meta_description,
    keywords: blog.keywords,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: {
      title: blog.meta_title || blog.title,
      description: blog.meta_description,
      images: blog.cover_image ? [blog.cover_image] : [],
      type: 'article',
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.meta_description,
    image: blog.cover_image,
    datePublished: blog.created_at,
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-4xl font-bold mb-3">{blog.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Published {formatDate(blog.created_at)}
      </p>

      {blog.cover_image && (
        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-8 relative">
          <Image
            src={blog.cover_image}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content || '' }}
      />
    </article>
  );
}