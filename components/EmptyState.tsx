type Props = {
  emoji?: string;
  title?: string;
  text?: string;
};

export default function EmptyState({ emoji = '🎮', title, text }: Props) {
  return (
    <div className="empty-state">
      <div className="emoji">{emoji}</div>
      {title && (
        <p className="font-bold mb-1" style={{ color: 'var(--ink)' }}>
          {title}
        </p>
      )}
      {text && (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {text}
        </p>
      )}
    </div>
  );
}
