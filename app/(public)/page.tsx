import Link from 'next/link';
import Image from 'next/image';
import { getAllGames, getLatestLevels, getLatestBlogs } from '@/lib/db';

export const revalidate = 60; // 60 seconds me refresh hoga

export default async function HomePage() {
  const [games, levels, blogs] = await Promise.all([
    getAllGames(),
    getLatestLevels(12),
    getLatestBlogs(6),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ================= HERO ================= */}
      <section className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🧩 Puzzle Game Walkthroughs
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Complete video guides for every puzzle game. Level by level solutions,
          tips and tricks — all in one place.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/blog"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Read Blog
          </Link>
          <Link
            href="/about"
            className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* ================= ALL GAMES ================= */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🎮 All Games</h2>
          <span className="text-sm text-gray-500">{games.length} games</span>
        </div>

        {games.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-10 text-center text-gray-500">
            <p className="mb-2">Abhi koi game add nahi hui.</p>
            <p className="text-sm">
              Admin panel se game add karo → yahan dikhegi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.slug}`}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition group"
              >
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {game.cover_image ? (
                    <Image
                      src={game.cover_image}
                      alt={game.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🎮
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold line-clamp-1">{game.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {game.total_levels || 0} levels
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ================= LATEST LEVELS ================= */}
      {levels.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🆕 Latest Levels</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level) => (
              <Link
                key={level.id}
                href={`/game/${level.game_id}/level-${level.level_number}`}
                className="border rounded-xl p-4 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                    {level.level_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-1">
                      {level.title || `Level ${level.level_number}`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {level.views} views
                    </p>
                  </div>
                </div>
                {level.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {level.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= LATEST BLOGS ================= */}
      {blogs.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📝 Latest Guides</h2>
            <Link href="/blog" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition group"
              >
                {blog.cover_image && (
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <Image
                      src={blog.cover_image}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-2">
                    {blog.title}
                  </h3>
                  {blog.meta_description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {blog.meta_description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}