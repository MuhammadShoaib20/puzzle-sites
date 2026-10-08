import Link from 'next/link';

type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="breadcrumb"
      style={{ fontSize: 'clamp(0.78rem, 1.3vw, 0.88rem)' }}
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="crumb">
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className="crumb-current" aria-current="page">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="crumb-sep" aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  );
}
