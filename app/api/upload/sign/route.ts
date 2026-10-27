import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import { supabaseAdmin } from '@/lib/supabase';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);
const MAX_SIZE = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unauthorized:')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Upload authorization failed:', error);
    return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid upload details.' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const type = input.type;
  const size = input.size;
  const folder =
    typeof input.folder === 'string'
      ? input.folder.replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'general'
      : 'general';

  if (typeof type !== 'string' || !ALLOWED_TYPES.has(type)) {
    return NextResponse.json(
      { error: 'File type not allowed. Use JPG, PNG, WebP, GIF or AVIF.' },
      { status: 400 }
    );
  }
  if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0 || size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5MB after compression).' }, { status: 400 });
  }

  const path = `${folder}/${randomUUID()}.${EXTENSIONS[type]}`;
  const { data, error } = await supabaseAdmin.storage
    .from('images')
    .createSignedUploadUrl(path);

  if (error) {
    console.error('Could not create Supabase upload URL:', error.message);
    return NextResponse.json({ error: 'Could not prepare image upload.' }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
