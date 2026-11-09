import { getAllPublishedBlogsForSitemap } from '@/lib/db';
import { canonicalUrl } from '@/lib/seo';
import { createUrlSetResponse } from '@/lib/sitemap-xml';

export const revalidate = 86400;

export async function GET(): Promise<Response> {
  const blogs = await getAllPublishedBlogsForSitemap();

  return createUrlSetResponse(
    blogs.map((blog) => ({
      url: canonicalUrl(`/blog/${blog.slug}`),
      lastModified: blog.updated_at || blog.created_at,
      changeFrequency: 'weekly',
      priority: 0.9,
    }))
  );
}
