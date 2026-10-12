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

# Admin Security (REQUIRED)
ADMIN_SECRET_PATH=ms-control-9x7k2p
ADMIN_ACCESS_KEY=84729153

# Email Notifications (Optional)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important for Production (Vercel)**:
- Set `NEXTAUTH_URL=https://puzzlewalkthroughs.com`
- Set `NEXT_PUBLIC_SITE_URL=https://puzzlewalkthroughs.com`
- Set `SUPABASE_SECRET_KEY` (required for server-side admin operations)

## Setting Up Resend API for Email Notifications

To receive email notifications when someone logs into your admin panel:

1. **Create a Resend account** at [resend.com](https://resend.com)
2. **Get your API key** from the Resend dashboard
3. **Add the API key** to your environment variables:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **Verify your domain** (optional but recommended for production):
   - Go to Resend dashboard → Domains
   - Add your domain (e.g., puzzlewalkthroughs.com)
   - Add the DNS records provided by Resend
   - Wait for verification

**Note**: If `RESEND_API_KEY` is not set, login will still work but you'll see a console warning instead of receiving emails.

## LLM Training Data

This site provides a structured `llms.txt` file at `/llms.txt` for AI/LLM training. It includes:
- Site overview and ownership information
- Main page links with descriptions
- Navigation links
- Usage policy for personal vs commercial use

The file is accessible at: `https://puzzlewalkthroughs.com/llms.txt`

## Getting Started

First, run the development server:

```bash
npm run dev
```

Access the admin panel at: `http://localhost:3000/ms-control-9x7k2p/login`

## Security Features

The admin panel includes comprehensive security measures:
- **Obscure admin path**: Custom secret path (server-side only, via `ADMIN_SECRET_PATH`)
- **Access Key Layer**: 8-digit code required before login screen
- **Rate Limiting**: 5 failed attempts per email/IP in 15 minutes
- **Login Attempts Logging**: All attempts logged to database
- **Email Notifications**: Email sent to admin on successful login (via Resend)
- **Session Security**: 30-minute inactivity timeout
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Noindex Meta Tags**: Admin pages excluded from search engines
- **Server-side IP Detection**: IP address obtained from server headers (no client-side calls)

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

**IMPORTANT**: Add these environment variables in Vercel:
- `NEXTAUTH_URL=https://puzzlewalkthroughs.com`
- `NEXT_PUBLIC_SITE_URL=https://puzzlewalkthroughs.com`
- `ADMIN_SECRET_PATH` (use a custom value, not the default)
- `ADMIN_ACCESS_KEY` (use a custom 8-digit code)
- `RESEND_API_KEY` (optional, for email notifications)

Make sure to add all environment variables in your Vercel project settings.
