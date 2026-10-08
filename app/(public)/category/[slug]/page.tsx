import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getAllGames } from '@/lib/db';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const allGames = await getAllGames();
  const games = allGames.filter((g) => g.category_id === category.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-3">{category.name}</h1>
      {category.description && (
        <p className="text-gray-600 mb-8">{category.description}</p>
      )}

      {games.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-10 text-center text-gray-500">
          Is category me abhi koi game nahi.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.slug}`}
              className="border rounded-xl p-4 hover:shadow-lg transition"
            >
              <h3 className="font-semibold">{game.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{game.total_levels} levels</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}