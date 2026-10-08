import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Our privacy policy explains how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>Information We Collect</h2>
        <p>We use Google Analytics and Google AdSense which may collect anonymous usage data.</p>
        <h2>Cookies</h2>
        <p>We use cookies to improve user experience and serve relevant ads.</p>
        <h2>Third-Party Services</h2>
        <p>Our site embeds YouTube videos. YouTube may collect data as per their privacy policy.</p>
        <h2>Contact</h2>
        <p>For privacy questions, email contact@yoursite.com.</p>
      </div>
    </div>
  );
}