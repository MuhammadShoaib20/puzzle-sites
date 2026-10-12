import type { Page } from '@/types';
import { sanitize } from '@/lib/sanitize';

export default function PageContent({ page }: { page: Page }) {
  return (
    <article className="container-narrow animate-fade-in-up pt-10 pb-16">
      <h1 className="page-title mb-8">{page.title}</h1>
      <div
        className="prose max-w-none text-[16px]"
        dangerouslySetInnerHTML={{ __html: sanitize(page.content || '') }}
      />
    </article>
  );
}
