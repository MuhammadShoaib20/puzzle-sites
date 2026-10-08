import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import LevelForm from '@/components/LevelForm';
import { updateLevel } from '@/lib/actions/levels';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string; levelId: string }> };

export default async function EditLevelPage({ params }: Props) {
  const { id, levelId } = await params;

  const { data: game } = await supabaseAdmin
    .from('games')
    .select('id, name, slug')
    .eq('id', id)
    .single();

  if (!game) notFound();

  const { data: level } = await supabaseAdmin
    .from('levels')
    .select('*')
    .eq('id', levelId)
    .single();

  if (!level) notFound();

  const action = updateLevel.bind(null, levelId, id);

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href={`/admin/games/${id}/levels`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Levels
      </Link>
      <h1 className="text-3xl font-bold mt-2 mb-8">
        Edit {game.name} — Level {level.level_number}
      </h1>

      <LevelForm action={action} level={level} submitLabel="Update Level" />
    </div>
  );
}