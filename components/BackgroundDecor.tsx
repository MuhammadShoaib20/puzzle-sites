type Piece = { x: string; y: string; s: number; r: number; c: 'sky' | 'indigo' | 'orange'; d: number; t: number };

// Positions are kept near the page edges so text stays readable.
const PIECES: Piece[] = [
  { x: '3%', y: '16%', s: 96, r: -14, c: 'sky', d: 0, t: 11 },
  { x: '90%', y: '10%', s: 120, r: 18, c: 'indigo', d: -3, t: 13 },
  { x: '93%', y: '58%', s: 84, r: -8, c: 'orange', d: -6, t: 10 },
  { x: '1.5%', y: '64%', s: 112, r: 12, c: 'indigo', d: -2, t: 14 },
  { x: '11%', y: '90%', s: 76, r: -20, c: 'orange', d: -5, t: 12 },
  { x: '85%', y: '88%', s: 100, r: 10, c: 'sky', d: -8, t: 15 },
];

export default function BackgroundDecor() {
  return (
    <div className="bg-decor" aria-hidden="true">
      {PIECES.map((p, i) => (
        <div
          key={i}
          className={`bg-piece ${p.c}`}
          style={
            {
              left: p.x,
              top: p.y,
              width: p.s,
              height: p.s,
              '--r': `${p.r}deg`,
              animationDelay: `${p.d}s`,
              animationDuration: `${p.t}s`,
            } as React.CSSProperties
          }
        >
          <svg viewBox="-10 -10 120 120">
            <path d="M10 10 H38 C38 -6 62 -6 62 10 H90 V38 C106 38 106 62 90 62 V90 H10 V62 C22 62 22 38 10 38 Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
