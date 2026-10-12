# Puzzle Walkthroughs

A Next.js 16 + Supabase puzzle game walkthrough site with cookie consent and analytics.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# Analytics (Optional - loaded only with user consent)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GSC_VERIFICATION=your_google_verification_code
```

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Cookie Consent Banner

The site includes a GDPR-compliant cookie consent banner that:
- Shows on first visit (no localStorage consent key)
- Saves choice to localStorage (`cookie-consent`: `accepted` or `rejected`)
- Only loads Google Analytics when user accepts
- "Cookie Settings" link in footer allows users to change their choice
- Styled with Tailwind, dark/light mode compatible
- Mobile: full-width bottom banner
- Desktop: full-width bottom banner

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Make sure to add all environment variables in your Vercel project settings.
