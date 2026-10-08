import { sanitizeAdsense } from '@/lib/sanitize';

type Props = {
  code?: string | null;
  label?: string;
  variant?: 'banner' | 'square' | 'skyscraper';
};

export default function AdSlot({
  code,
  label = 'Ad',
  variant = 'banner',
}: Props) {
  if (!code?.trim()) return null;
  const cleanCode = sanitizeAdsense(code);
  if (!cleanCode.trim()) return null;

  const heights = {
    banner: 'min-h-[90px]',
    square: 'min-h-[250px]',
    skyscraper: 'min-h-[600px]',
  };

  return (
    <div className="ad-wrap" data-ad-label={label}>
      <div className="ad-label">Advertisement</div>
      <div className={`ad-box ${heights[variant]}`}>
        <div dangerouslySetInnerHTML={{ __html: cleanCode }} />
      </div>
    </div>
  );
}
