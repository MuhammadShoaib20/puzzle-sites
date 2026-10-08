import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold mb-3">🧩 PuzzleWalkthroughs</h3>
          <p className="text-sm">
            Complete video walkthroughs for all puzzle games.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">Follow</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://youtube.com" target="_blank" rel="noopener" className="hover:text-white">YouTube</a></li>
            <li><a href="https://facebook.com" target="_blank" rel="noopener" className="hover:text-white">Facebook</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-white">Twitter</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-sm">
        © {new Date().getFullYear()} PuzzleWalkthroughs. All rights reserved.
      </div>
    </footer>
  );
}