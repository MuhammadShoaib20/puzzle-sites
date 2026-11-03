import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogBySlug, getAllBlogSlugs, getRelatedBlogs } from '@/lib/db';
import { formatIsoDate } from '@/lib/utils';
import { generateArticleSchema, generateBreadcrumbSchema, extractFaqsFromHtml, generateFAQSchema } from '@/lib/schema';
import ViewTracker from '@/components/ViewTracker';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';
import { sanitize } from '@/lib/sanitize';
import { canonicalUrl } from '@/lib/seo';

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

  const title = (blog.meta_title || blog.title).slice(0, 60);

  return {
    title,
    description: blog.meta_description,
    keywords: blog.keywords,
    alternates: {
      canonical: canonicalUrl(`/blog/${blog.slug}`),
      languages: { en: canonicalUrl(`/blog/${blog.slug}`) },
    },
    openGraph: {
      title,
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

  const siteUrl = canonicalUrl('/');

  const [relatedBlogs] = await Promise.all([
    getRelatedBlogs(blog.id, blog.game_id, 3),
  ]);

  const articleSchema = generateArticleSchema({
    ...blog,
    canonicalUrl: `${siteUrl}/blog/${blog.slug}`,
  });
  const publishedAt = blog.published_date || blog.created_at;
  const publishedDate = formatIsoDate(publishedAt);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { position: 1, name: 'Home', item: siteUrl },
    { position: 2, name: 'Blog', item: `${siteUrl}/blog` },
    { position: 3, name: blog.title, item: `${siteUrl}/blog/${blog.slug}` },
  ]);

  const faqs = extractFaqsFromHtml(blog.content || '');
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

  return (
    <article className="animate-fade-in-up">
      <ViewTracker type="blog" id={blog.id} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

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
          <span>
            Published on: <time dateTime={publishedDate}>{publishedDate}</time>
          </span>
          <span>By MS Digital System</span>
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

        <aside
          className="mt-10 rounded-xl border p-5"
          style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
          aria-label="About the author"
        >
          <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>
            MS Digital System
          </h2>
          <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>
            MS Digital System publishes clear, practical puzzle walkthroughs to help players solve
            tricky levels.
          </p>
        </aside>

        {relatedBlogs.length > 0 && (
          <section className="mt-12 pt-8" style={{ borderTop: '1px solid var(--line)' }}>
            <h2 className="section-title mb-5">Related guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog.id}
                  href={`/blog/${relatedBlog.slug}`}
                  prefetch={false}
                  className="card card-hover p-4"
                >
                  <h3 className="font-bold text-[15px] mb-2" style={{ color: 'var(--ink)' }}>
                    {relatedBlog.title}
                  </h3>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--muted)' }}>
                    {relatedBlog.meta_description || relatedBlog.content?.slice(0, 100)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--line)' }}>
          <Link href="/blog" className="btn btn-secondary">
            ← Back to all guides
          </Link>
        </div>
      </div>
    </article>
  );
}
