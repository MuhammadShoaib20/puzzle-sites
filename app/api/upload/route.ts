import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/require-auth';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const folder = ((formData.get('folder') as string) || 'general')
    .replace(/[^a-z0-9-]/gi, '')
    .slice(0, 40) || 'general';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'File type not allowed. Use JPG, PNG, WebP, GIF or AVIF.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File too large (max 5MB).' },
      { status: 400 }
    );
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().slice(0, 5);
  const filename = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from('images')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: '31536000',
    });

  if (uploadError) {
    console.error('Upload error:', uploadError.message);
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data } = supabaseAdmin.storage.from('images').getPublicUrl(filename);

  return NextResponse.json({ url: data.publicUrl });
}
