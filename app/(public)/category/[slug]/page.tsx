import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategoryBySlug, getGamesByCategory } from '@/lib/db';
import Breadcrumb from '@/components/Breadcrumb';
import GameCard from '@/components/GameCard';
import EmptyState from '@/components/EmptyState';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description:
      category.description ||
      `Browse all puzzle games in ${category.name} category.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const games = await getGamesByCategory(category.id);

  return (
    <div className="container-page py-8 md:py-14 animate-fade-in-up">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: category.name }]} />

      <header className="mt-5 mb-8 md:mb-10">
        <h1 className="page-title">{category.name}</h1>
        {category.description && <p className="page-sub">{category.description}</p>}
        <div className="mt-4">
          <span className="badge badge-primary">{games.length} games</span>
        </div>
      </header>

      {games.length === 0 ? (
        <EmptyState emoji="🎮" text="No games in this category yet." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {games.map((game, idx) => (
            <GameCard key={game.id} game={game} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
