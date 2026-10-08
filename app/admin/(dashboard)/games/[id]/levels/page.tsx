import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import BulkGenerateForm from '@/components/BulkGenerateForm';
import DeleteLevelButton from '@/components/DeleteLevelButton';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function AdminLevelsPage({ params }: Props) {
  const { id } = await params;

  const { data: game } = await supabaseAdmin
    .from('games')
    .select('*')
    .eq('id', id)
    .single();

  if (!game) notFound();

  const { data: levels } = await supabaseAdmin
    .from('levels')
    .select('*')
    .eq('game_id', id)
    .order('level_number', { ascending: true });

  const levelList = levels || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/games"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Games
        </Link>
        <h1 className="text-3xl font-bold mt-2">{game.name} — Levels</h1>
        <p className="text-gray-600 mt-1">
          {levelList.length} levels ·{" "}
          <Link
            href={`/game/${game.slug}`}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            View public page →
          </Link>
        </p>
      </div>

      {/* Bulk Generate */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-3">⚡ Bulk Generate Levels</h2>
        <p className="text-sm text-gray-700 mb-4">
          Quickly generate multiple level slots at once. Default YouTube URL optional
          hai — baad me edit kar sakte ho.
        </p>
        <BulkGenerateForm gameId={id} />
      </div>

      {/* Add Single Level */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">All Levels</h2>
        <Link
          href={`/admin/games/${id}/levels/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
        >
          + Add Single Level
        </Link>
      </div>

      {/* Levels List */}
      {levelList.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-xl p-12 text-center text-gray-500">
          <p>Abhi koi level nahi. Bulk generate use karo upar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {levelList.map((level) => (
            <div
              key={level.id}
              className="bg-white border rounded-lg p-3 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-xl font-bold text-blue-600">
                  {level.level_number}
                </div>
                {!level.published && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    Draft
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-3 truncate">
                {level.youtube_id ? `🎥 ${level.youtube_id.slice(0, 8)}...` : "No video"}
              </div>
              <div className="flex items-center justify-between text-xs">
                <Link
                  href={`/admin/games/${id}/levels/${level.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <DeleteLevelButton
                  levelId={level.id}
                  gameId={id}
                  levelNumber={level.level_number}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}