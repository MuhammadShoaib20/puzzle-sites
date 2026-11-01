import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageContent from '@/components/PageContent';
import { getPageBySlug } from '@/lib/db';
import { getPageMetadata } from '@/lib/page-metadata';
import { canonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(await getPageBySlug('privacy'), canonicalUrl('/privacy'));
}

export default async function PrivacyPage() {
  const page = await getPageBySlug('privacy');
  if (!page) notFound();
  return <PageContent page={page} />;
}
