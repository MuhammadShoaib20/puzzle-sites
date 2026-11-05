import { createDecipheriv, createCipheriv, randomBytes } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';

const BING_API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';

export type BingCredentialRecord = {
  id: number;
  api_key_encrypted: string;
  site_url: string;
  status: 'connected' | 'verification_failed';
  last_submitted_at: string | null;
  last_error: string | null;
  updated_at: string;
};

function getEncryptionKey(): Buffer {
  const configuredKey = process.env.BING_CREDENTIALS_ENCRYPTION_KEY;
  if (!configuredKey) throw new Error('BING_CREDENTIALS_ENCRYPTION_KEY is not configured.');

  const key = Buffer.from(configuredKey, 'base64');
  if (key.length !== 32) {
    throw new Error('BING_CREDENTIALS_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  }
  return key;
}

export function encryptBingApiKey(apiKey: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join(':');
}

export function decryptBingApiKey(encryptedApiKey: string): string {
  const [ivValue, tagValue, encryptedValue] = encryptedApiKey.split(':');
  if (!ivValue || !tagValue || !encryptedValue) throw new Error('Stored Bing API key is invalid.');

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivValue, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagValue, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

export function normalizeBingSiteUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('Enter a valid HTTPS site URL, such as https://example.com/.');
  }

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('Use the HTTPS root URL for your site, without a path or query string.');
  }
  return `${url.origin}/`;
}

async function callBingApi(operation: string, apiKey: string, values: Record<string, string> = {}) {
  const url = new URL(`${BING_API_BASE}/${operation}`);
  url.searchParams.set('apikey', apiKey);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const data = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
    const error = data.error && typeof data.error === 'object'
      ? data.error as Record<string, unknown>
      : data;
    const reason = typeof error.message === 'string'
      ? error.message
      : typeof error.Message === 'string'
        ? error.Message
        : `Bing returned HTTP ${response.status}.`;
    throw new Error(reason);
  }
  return payload;
}

export async function verifyBingSite(apiKey: string, siteUrl: string): Promise<boolean> {
  const payload = await callBingApi('GetUserSites', apiKey);
  const data = payload && typeof payload === 'object'
    ? (payload as Record<string, unknown>).d
    : null;
  const sites = Array.isArray(data) ? data : [];

  return sites.some((site) => {
    if (!site || typeof site !== 'object') return false;
    const value = site as Record<string, unknown>;
    const url = typeof value.Url === 'string' ? value.Url : value.url;
    const isVerified = value.IsVerified === true || value.IsVerified === 'true';
    if (typeof url !== 'string' || !isVerified) return false;
    try {
      return normalizeBingSiteUrl(url) === siteUrl;
    } catch {
      return false;
    }
  });
}

export async function submitBingSitemap(apiKey: string, siteUrl: string): Promise<void> {
  await callBingApi('SubmitFeed', apiKey, {
    siteUrl,
    feedUrl: `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
  });
}

export async function getBingCredentialRecord(): Promise<BingCredentialRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('bing_credentials')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(`Could not read Bing settings: ${error.message}`);
  return data as BingCredentialRecord | null;
}

export async function saveBingCredentialRecord(
  record: Omit<BingCredentialRecord, 'id'>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('bing_credentials')
    .upsert({ id: 1, ...record }, { onConflict: 'id' });
  if (error) throw new Error(`Could not save Bing settings: ${error.message}`);
}