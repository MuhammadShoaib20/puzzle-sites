import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import LevelForm from '@/components/LevelForm';
import { createLevel } from '@/lib/actions/levels';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function NewLevelPage({ params }: Props) {
  const { id } = await params;

  const { data: game } = await supabaseAdmin
    .from('games')
    .select('id, name, slug')
    .eq('id', id)
    .single();

  if (!game) notFound();

  const action = createLevel.bind(null, id);

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href={`/admin/games/${id}/levels`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Levels
      </Link>
      <h1 className="text-3xl font-bold mt-2 mb-8">
        Add Level to {game.name}
      </h1>

      <LevelForm action={action} submitLabel="Create Level" />
    </div>
  );
}