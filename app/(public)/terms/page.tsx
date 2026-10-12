import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageContent from '@/components/PageContent';
import { getPageBySlug } from '@/lib/db';
import { getPageMetadata } from '@/lib/page-metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(await getPageBySlug('terms'));
}

export default async function TermsPage() {
  const page = await getPageBySlug('terms');
  if (!page) notFound();
  return <PageContent page={page} />;
}
