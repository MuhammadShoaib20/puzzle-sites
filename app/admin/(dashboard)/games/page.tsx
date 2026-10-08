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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Games</h1>
          <p className="text-gray-600 mt-1">{games.length} total games</p>
        </div>
        <Link
          href="/admin/games/new"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + Add New Game
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">Abhi koi game nahi hai.</p>
          <Link
            href="/admin/games/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            + Create First Game
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Levels</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{game.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    {game.slug}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {game.total_levels || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {game.published ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Published
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/games/${game.id}/levels`}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Levels
                    </Link>
                    <Link
                      href={`/admin/games/${game.id}/edit`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteGameButton id={game.id} name={game.name} />
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