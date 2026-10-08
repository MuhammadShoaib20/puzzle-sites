import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for using Puzzle Walkthroughs.',
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of service" subtitle="The rules for using this site.">
      <p>By using this site, you agree to these terms.</p>
      <h2>Use of content</h2>
      <p>All content is for informational purposes only.</p>
      <h2>External links</h2>
      <p>We embed YouTube videos and link to external sites. We are not responsible for their content.</p>
    </StaticPage>
  );
}
