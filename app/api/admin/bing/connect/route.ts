import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import {
  decryptBingApiKey,
  encryptBingApiKey,
  getBingCredentialRecord,
  normalizeBingSiteUrl,
  saveBingCredentialRecord,
  submitBingSitemap,
  verifyBingSite,
} from '@/lib/bing-webmaster';
import { supabaseAdmin } from '@/lib/supabase';

async function authorize() {
  try {
    await requireAuth();
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unauthorized:')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Bing route authorization failed:', error);
    return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await authorize();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid connection details.' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  if (typeof input.siteUrl !== 'string' || (input.apiKey !== undefined && typeof input.apiKey !== 'string')) {
    return NextResponse.json({ error: 'Enter a site URL and Bing API key.' }, { status: 400 });
  }

  let siteUrl: string;
  try {
    siteUrl = normalizeBingSiteUrl(input.siteUrl);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid site URL.' }, { status: 400 });
  }

  try {
    const existing = await getBingCredentialRecord();
    const apiKey = typeof input.apiKey === 'string' && input.apiKey.trim()
      ? input.apiKey.trim()
      : existing
        ? decryptBingApiKey(existing.api_key_encrypted)
        : '';
    if (!apiKey) return NextResponse.json({ error: 'Enter your Bing Webmaster Tools API key.' }, { status: 400 });

    const encryptedKey = encryptBingApiKey(apiKey);
    let verified = false;
    let verificationError: string | null = null;
    try {
      verified = await verifyBingSite(apiKey, siteUrl);
    } catch (error) {
      verificationError = error instanceof Error ? error.message : 'Bing verification failed.';
    }

    if (!verified) {
      const error = verificationError || 'This site is not verified in the Bing account. Verify it in Bing Webmaster Tools, then reconnect.';
      await saveBingCredentialRecord({
        api_key_encrypted: encryptedKey,
        site_url: siteUrl,
        status: 'verification_failed',
        last_submitted_at: existing?.last_submitted_at || null,
        last_error: error,
        updated_at: new Date().toISOString(),
      });
      return NextResponse.json({ error, status: 'verification_failed' }, { status: 422 });
    }

    let sitemapSubmitted = false;
    let submitError: string | null = null;
    try {
      await submitBingSitemap(apiKey, siteUrl);
      sitemapSubmitted = true;
    } catch (error) {
      submitError = error instanceof Error ? error.message : 'Sitemap submission failed.';
    }

    await saveBingCredentialRecord({
      api_key_encrypted: encryptedKey,
      site_url: siteUrl,
      status: 'connected',
      last_submitted_at: sitemapSubmitted ? new Date().toISOString() : existing?.last_submitted_at || null,
      last_error: submitError,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      status: 'connected',
      sitemapSubmitted,
      warning: submitError,
    });
  } catch (error) {
    console.error('Bing connection failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not connect Bing.' }, { status: 500 });
  }
}

export async function DELETE() {
  const unauthorized = await authorize();
  if (unauthorized) return unauthorized;

  const { error } = await supabaseAdmin.from('bing_credentials').delete().eq('id', 1);
  if (error) return NextResponse.json({ error: 'Could not disconnect Bing.' }, { status: 500 });
  return NextResponse.json({ success: true });
}