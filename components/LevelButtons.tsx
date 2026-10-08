import Link from 'next/link';

type Level = {
  id: string;
  level_number: number;
};

type Props = {
  gameSlug: string;
  levels: Level[];
};

export default function LevelButtons({ gameSlug, levels }: Props) {
  if (levels.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-xl p-8 text-center text-gray-500">
        Abhi koi level add nahi hua.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-2">
      {levels.map((level) => (
        <Link
          key={level.id}
          href={`/game/${gameSlug}/level-${level.level_number}`}
          className="text-center py-3 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-lg font-semibold transition"
        >
          {level.level_number}
        </Link>
      ))}
    </div>
  );
}