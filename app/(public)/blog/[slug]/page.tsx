import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogBySlug, getAllBlogSlugs } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/schema';
import ViewTracker from '@/components/ViewTracker';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';
import { sanitize } from '@/lib/sanitize';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const blogs = await getAllBlogSlugs();
  return blogs.map((item) => ({ slug: item.slug }));
}

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

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com').replace(/\/$/, '');

  const articleSchema = generateArticleSchema({
    ...blog,
    canonicalUrl: `${siteUrl}/blog/${blog.slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { position: 1, name: 'Home', item: siteUrl },
    { position: 2, name: 'Blog', item: `${siteUrl}/blog` },
    { position: 3, name: blog.title, item: `${siteUrl}/blog/${blog.slug}` },
  ]);

  return (
    <article className="animate-fade-in-up">
      <ViewTracker type="blog" id={blog.id} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="container-narrow pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: blog.title },
          ]}
        />
      </div>

      <div className="container-narrow pt-6 pb-4">
        <h1 className="page-title mb-4">{blog.title}</h1>

        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm pb-6 mb-8"
          style={{ color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}
        >
          <span>Published {formatDate(blog.created_at)}</span>
          <span aria-hidden="true">•</span>
          <span>{blog.views} views</span>
        </div>

        {blog.cover_image && (
          <div className="cover-frame mb-8 md:mb-10">
            <Image
              src={blog.cover_image}
              alt={blog.title}
              fill
              priority
              sizes="(max-width: 820px) 100vw, 820px"
            />
          </div>
        )}

        <div
          className="prose max-w-none text-[16px]"
          dangerouslySetInnerHTML={{ __html: sanitize(blog.content || '') }}
        />

        <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--line)' }}>
          <Link href="/blog" className="btn btn-secondary">
            ← Back to all guides
          </Link>
        </div>
      </div>
    </article>
  );
}
