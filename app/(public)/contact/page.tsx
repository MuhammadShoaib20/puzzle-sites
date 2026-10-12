import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageContent from '@/components/PageContent';
import { getPageBySlug } from '@/lib/db';
import { getPageMetadata } from '@/lib/page-metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(await getPageBySlug('contact'));
}

export default async function ContactPage() {
  const page = await getPageBySlug('contact');
  if (!page) notFound();
  return <PageContent page={page} />;
}
