import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Puzzle Walkthroughs.',
};

export default function ContactPage() {
  return (
    <StaticPage title="Contact us" subtitle="Questions, feedback, or a game you want covered? Write to us.">
      <p>Have questions, feedback, or business inquiries? Reach out to us:</p>
      <p>
        <strong>Email:</strong> contact@yoursite.com
      </p>
    </StaticPage>
  );
}
