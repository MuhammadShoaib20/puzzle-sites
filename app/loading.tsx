export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="tile solved"
              style={{
                width: 22,
                height: 22,
                borderRadius: 8,
                boxShadow: '0 3px 0 #0369A1',
                animation: `tilePop 700ms ease ${i * 160}ms infinite alternate both`,
              }}
            />
          ))}
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
          Loading…
        </p>
      </div>
    </div>
  );
}
