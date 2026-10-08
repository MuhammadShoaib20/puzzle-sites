import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Puzzle Walkthroughs — your source for complete puzzle game guides.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      <div className="prose max-w-none">
        <p>Welcome to Puzzle Walkthroughs — your one-stop destination for complete video guides on puzzle games.</p>
        <p>We provide level-by-level walkthroughs, tips, and tricks to help you beat even the toughest puzzles.</p>
      </div>
    </div>
  );
}