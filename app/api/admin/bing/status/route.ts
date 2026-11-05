import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import { getBingCredentialRecord } from '@/lib/bing-webmaster';

async function getIndexNowStatus() {
  const key = process.env.INDEXNOW_KEY || '';
  let keyFileMatches = false;

  if (/^[a-f0-9]{8,128}$/i.test(key)) {
    try {
      const keyFile = await readFile(path.join(process.cwd(), 'public', `${key}.txt`), 'utf8');
      keyFileMatches = keyFile.trim() === key;
    } catch {
      keyFileMatches = false;
    }
  }

  let lastSubmittedAt: string | null = null;
  try {
    const state = JSON.parse(await readFile(path.join(process.cwd(), '.indexnow-state.json'), 'utf8')) as {
      lastSubmittedAt?: unknown;
    };
    if (typeof state.lastSubmittedAt === 'string') lastSubmittedAt = state.lastSubmittedAt;
  } catch {
    lastSubmittedAt = null;
  }

  const configured = keyFileMatches;
  const active = configured && process.env.NODE_ENV === 'production' && process.env.INDEXNOW_SUBMIT === 'true';

  return {
    configured,
    active,
    dryRun: configured && !active,
    lastSubmittedAt,
  };
}

export async function GET() {
  try {
    await requireAuth();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unauthorized:')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Bing status authorization failed:', error);
    return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 });
  }

  try {
    const record = await getBingCredentialRecord();
    const indexNow = await getIndexNowStatus();
    return NextResponse.json({
      connected: record?.status === 'connected',
      status: record?.status || 'not_connected',
      siteUrl: record?.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlewalkthroughs.com',
      hasApiKey: Boolean(record?.api_key_encrypted),
      lastSubmittedAt: record?.last_submitted_at || null,
      lastError: record?.last_error || null,
      indexNow,
    });
  } catch (error) {
    console.error('Bing status check failed:', error);
    return NextResponse.json({ error: 'Could not load Bing connection status.' }, { status: 500 });
  }
}