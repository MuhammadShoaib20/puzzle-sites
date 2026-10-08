import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for using Puzzle Walkthroughs.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <div className="prose max-w-none">
        <p>By using this site, you agree to these terms.</p>
        <h2>Use of Content</h2>
        <p>All content is for informational purposes only.</p>
        <h2>External Links</h2>
        <p>We embed YouTube videos and link to external sites. We are not responsible for their content.</p>
      </div>
    </div>
  );
}