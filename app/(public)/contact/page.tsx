import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Puzzle Walkthroughs.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <div className="prose max-w-none">
        <p>Have questions, feedback, or business inquiries? Reach out to us:</p>
        <p><strong>Email:</strong> contact@yoursite.com</p>
      </div>
    </div>
  );
}