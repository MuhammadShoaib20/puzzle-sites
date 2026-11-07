import type { MetadataRoute } from 'next';
import { CANONICAL_SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  // We don't disallow the admin path here since it's obscure and changes
  // Security through obscurity is not our primary defense
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${CANONICAL_SITE_URL}/sitemap.xml`,
    host: CANONICAL_SITE_URL,
  };
}