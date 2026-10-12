import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageForm from '@/components/PageForm';
import { updatePage } from '@/lib/actions/pages';
import { supabaseAdmin } from '@/lib/supabase';
import type { Page } from '@/types';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditPagePage({ params }: Props) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('pages')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Could not load page: ${error.message}`);
  if (!data) notFound();

  const action = updatePage.bind(null, id);

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/ms-control-9x7k2p/pages" className="text-sm text-blue-600 hover:underline">
        ← Back to Pages
      </Link>
      <h1 className="text-3xl font-bold mt-2 mb-8">Edit Page</h1>
      <PageForm action={action} page={data as Page} submitLabel="Update Page" />
    </div>
  );
}
