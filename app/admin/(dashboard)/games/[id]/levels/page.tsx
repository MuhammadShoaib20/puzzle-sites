import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import BulkGenerateForm from '@/components/BulkGenerateForm';
import BulkEditForm from '@/components/BulkEditForm';
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
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <Link href="/admin/games" className="admin-back">
            ← Back to games
          </Link>
          <h1 className="admin-title mt-2">{game.name} — Levels</h1>
          <p className="admin-sub">
            {levelList.length} levels ·{' '}
            <Link
              href={`/game/${game.slug}`}
              target="_blank"
              className="font-bold"
              style={{ color: 'var(--primary-dark)' }}
            >
              View public page →
            </Link>
          </p>
        </div>
        <Link href={`/admin/games/${id}/levels/new`} className="btn btn-primary btn-sm">
          + Add single level
        </Link>
      </div>

      <div className="card admin-panel admin-panel-tint" style={{ marginBottom: '1.75rem' }}>
        <h2>⚡ Bulk generate levels</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>
          Create many level slots at once. The default YouTube URL is optional — you can edit each level later.
        </p>
        <BulkGenerateForm gameId={id} />
      </div>

      {levelList.length > 0 && (
        <div className="card admin-panel admin-panel-tint" style={{ marginBottom: '1.75rem' }}>
          <BulkEditForm gameId={id} existingLevels={levelList} />
        </div>
      )}

      <div className="section-head" style={{ marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.3rem' }}>All levels</h2>
      </div>

      {levelList.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🎯</div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No levels yet. Use bulk generate above.
          </p>
        </div>
      ) : (
        <div className="admin-level-grid">
          {levelList.map((level) => (
            <div key={level.id} className="card card-hover admin-level">
              <div className="flex items-start justify-between">
                <div className="num">{level.level_number}</div>
                {!level.published && <span className="pill pill-gray">Draft</span>}
              </div>
              <div className="vid">
                {level.youtube_id ? `🎥 ${level.youtube_id.slice(0, 11)}` : 'No video'}
              </div>
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/admin/games/${id}/levels/${level.id}/edit`}
                  className="act act-edit"
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
