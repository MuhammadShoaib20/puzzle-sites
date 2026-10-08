import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { updateGame } from '@/lib/actions/games';
import GameForm from '@/components/GameForm';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditGamePage({ params }: Props) {
  const { id } = await params;

  const { data: game } = await supabaseAdmin
    .from('games')
    .select('*')
    .eq('id', id)
    .single();

  if (!game) notFound();

  const action = updateGame.bind(null, id);

  return (
    <div className="admin-page animate-fade-in-up" style={{ maxWidth: 900 }}>
      <Link href="/admin/games" className="admin-back">
        ← Back to games
      </Link>
      <h1 className="admin-title mt-2 mb-8">Edit {game.name}</h1>

      <GameForm action={action} game={game} submitLabel="Update game" />
    </div>
  );
}
