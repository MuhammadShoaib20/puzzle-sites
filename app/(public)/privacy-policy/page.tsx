import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Our privacy policy explains how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy policy" subtitle="How we handle your data.">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>Information we collect</h2>
      <p>We use Google Analytics and Google AdSense which may collect anonymous usage data.</p>
      <h2>Cookies</h2>
      <p>We use cookies to improve user experience and serve relevant ads.</p>
      <h2>Third-party services</h2>
      <p>Our site embeds YouTube videos. YouTube may collect data as per their privacy policy.</p>
      <h2>Contact</h2>
      <p>For privacy questions, email contact@yoursite.com.</p>
    </StaticPage>
  );
}
