'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  gameSlug: string;
  levels: number[];
  currentLevel: number;
};

export default function LevelSelector({ gameSlug, levels, currentLevel }: Props) {
  const router = useRouter();
  const [ascending, setAscending] = useState(true);

  const sortedLevels = useMemo(
    () => [...levels].sort((a, b) => (ascending ? a - b : b - a)),
    [ascending, levels]
  );

  return (
    <div className="level-selector" role="group" aria-label="Level selector">
      <label className="sr-only" htmlFor="level-selector">
        Select a level
      </label>
      <select
        id="level-selector"
        value={currentLevel}
        onChange={(event) => {
          const levelNumber = Number(event.target.value);
          router.push(`/game/${gameSlug}/level-${levelNumber}`);
        }}
      >
        {sortedLevels.map((levelNumber) => (
          <option key={levelNumber} value={levelNumber}>
            Level {levelNumber}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="level-selector-sort"
        onClick={() => setAscending((current) => !current)}
        aria-label={`Sort levels ${ascending ? 'descending' : 'ascending'}`}
        title={`Sort levels ${ascending ? 'descending' : 'ascending'}`}
      >
        {ascending ? '↑' : '↓'}
      </button>
    </div>
  );
}
