import Link from 'next/link';

type Item = { id: string; level_number: number; title?: string };

type Props = {
  gameSlug: string;
  levels: Item[];
  heading?: string;
};

export default function PopularLevels({
  gameSlug,
  levels,
  heading = 'Popular levels',
}: Props) {
  if (levels.length === 0) return null;

  return (
    <div className="card p-5">
      <h3 className="text-[15px] font-bold mb-4">{heading}</h3>
      <div className="flex flex-col gap-1.5">
        {levels.map((item) => (
          <Link
            key={item.id}
            href={`/game/${gameSlug}/level-${item.level_number}`}
            className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-[var(--primary-soft)] group"
          >
            <span
              className="w-9 h-9 rounded-xl grid place-items-center shrink-0 text-[13px] font-bold text-white"
              style={{
                background: 'linear-gradient(180deg, #38BDF8, #0284C7)',
                boxShadow: '0 3px 0 #0369A1',
                fontFamily: 'var(--font-display), sans-serif',
              }}
            >
              {item.level_number}
            </span>
            <span
              className="text-[13.5px] font-semibold line-clamp-1 transition-colors group-hover:text-[var(--primary-dark)]"
              style={{ color: 'var(--ink)' }}
            >
              {item.title || `Level ${item.level_number}`}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
