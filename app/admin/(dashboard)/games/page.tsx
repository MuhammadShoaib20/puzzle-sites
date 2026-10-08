import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import DeleteGameButton from '@/components/DeleteGameButton';

export const dynamic = 'force-dynamic';

async function getGames() {
  const { data } = await supabaseAdmin
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function AdminGamesPage() {
  const games = await getGames();

  return (
    <div className="admin-page animate-fade-in-up">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Games</h1>
          <p className="admin-sub">{games.length} total games</p>
        </div>
        <Link href="/admin/games/new" className="btn btn-primary btn-sm">
          + Add game
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🎮</div>
          <p className="font-bold mb-4">No games yet</p>
          <Link href="/admin/games/new" className="btn btn-primary btn-sm">
            + Create first game
          </Link>
        </div>
      ) : (
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Levels</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="name">{game.name}</td>
                  <td className="mono">{game.slug}</td>
                  <td>
                    <span className="pill pill-blue">{game.total_levels || 0}</span>
                  </td>
                  <td>
                    {game.published ? (
                      <span className="pill pill-green">Published</span>
                    ) : (
                      <span className="pill pill-gray">Draft</span>
                    )}
                  </td>
                  <td className="right">
                    <span className="admin-actions">
                      <Link href={`/admin/games/${game.id}/levels`} className="act act-levels">
                        Levels
                      </Link>
                      <Link href={`/admin/games/${game.id}/edit`} className="act act-edit">
                        Edit
                      </Link>
                      <DeleteGameButton id={game.id} name={game.name} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
