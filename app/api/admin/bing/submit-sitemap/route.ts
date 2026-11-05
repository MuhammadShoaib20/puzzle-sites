import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import {
  type BingCredentialRecord,
  decryptBingApiKey,
  getBingCredentialRecord,
  saveBingCredentialRecord,
  submitBingSitemap,
  verifyBingSite,
} from '@/lib/bing-webmaster';

export async function POST() {
  try {
    await requireAuth();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unauthorized:')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Bing sitemap authorization failed:', error);
    return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 });
  }

  let record: BingCredentialRecord | null = null;
  try {
    record = await getBingCredentialRecord();
    if (!record) return NextResponse.json({ error: 'Connect Bing Webmaster Tools first.' }, { status: 409 });

    const apiKey = decryptBingApiKey(record.api_key_encrypted);
    if (!(await verifyBingSite(apiKey, record.site_url))) {
      const error = 'This site is no longer verified in the Bing account. Verify it in Bing Webmaster Tools, then reconnect.';
      await saveBingCredentialRecord({
        ...record,
        status: 'verification_failed',
        last_error: error,
        updated_at: new Date().toISOString(),
      });
      return NextResponse.json({ error, status: 'verification_failed' }, { status: 422 });
    }

    await submitBingSitemap(apiKey, record.site_url);
    const submittedAt = new Date().toISOString();
    await saveBingCredentialRecord({
      ...record,
      status: 'connected',
      last_submitted_at: submittedAt,
      last_error: null,
      updated_at: submittedAt,
    });
    return NextResponse.json({ success: true, submittedAt });
  } catch (error) {
    console.error('Bing sitemap submission failed:', error);
    if (record) {
      const message = error instanceof Error ? error.message : 'Could not submit the sitemap.';
      await saveBingCredentialRecord({
        ...record,
        last_error: message,
        updated_at: new Date().toISOString(),
      }).catch((saveError: unknown) => console.error('Could not save Bing submission error:', saveError));
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not submit the sitemap.' }, { status: 502 });
  }
}