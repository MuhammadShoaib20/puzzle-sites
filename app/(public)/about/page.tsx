import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Puzzle Walkthroughs — your source for complete puzzle game guides.',
};

export default function AboutPage() {
  return (
    <StaticPage
      title="About us"
      subtitle="Complete video guides for puzzle games, one level at a time."
    >
      <p>
        Welcome to Puzzle Walkthroughs — your one-stop destination for complete video guides on puzzle games.
      </p>
      <p>
        We provide level-by-level walkthroughs, tips, and tricks to help you beat even the toughest puzzles.
      </p>
    </StaticPage>
  );
}
