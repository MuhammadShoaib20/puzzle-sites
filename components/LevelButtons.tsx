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
      <div className="empty-state">
        <div className="emoji">🎯</div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>No levels added yet.</p>
      </div>
    );
  }

  return (
    <div className="level-grid">
      {levels.map((level) => (
        <Link
          key={level.id}
          href={`/game/${gameSlug}/level-${level.level_number}`}
          className="level-tile"
        >
          {level.level_number}
        </Link>
      ))}
    </div>
  );
}
