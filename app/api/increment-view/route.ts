import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const TABLES = {
  game: 'games',
  level: 'levels',
  blog: 'blogs',
} as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const { type, id } = payload as { type?: unknown; id?: unknown };
  if (
    typeof type !== 'string' ||
    !Object.prototype.hasOwnProperty.call(TABLES, type) ||
    typeof id !== 'string' ||
    !UUID_PATTERN.test(id)
  ) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const table = TABLES[type as keyof typeof TABLES];

  try {
    // Compare-and-set retries avoid losing concurrent increments without requiring a DB RPC.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { data: current, error: selectError } = await supabaseAdmin
        .from(table)
        .select('views')
        .eq('id', id)
        .maybeSingle();

      if (selectError) {
        console.error('View count read failed:', selectError.message);
        return NextResponse.json({ error: 'Could not update views' }, { status: 500 });
      }
      if (!current) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }

      const currentViews = current.views ?? 0;
      let updateQuery = supabaseAdmin
        .from(table)
        .update({ views: currentViews + 1 })
        .eq('id', id);
      updateQuery = current.views == null
        ? updateQuery.is('views', null)
        : updateQuery.eq('views', current.views);
      const { data: updated, error: updateError } = await updateQuery
        .select('views')
        .maybeSingle();

      if (updateError) {
        console.error('View count update failed:', updateError.message);
        return NextResponse.json({ error: 'Could not update views' }, { status: 500 });
      }
      if (updated) {
        return NextResponse.json({ success: true, views: updated.views });
      }
    }

    return NextResponse.json({ error: 'Please retry' }, { status: 409 });
  } catch (error) {
    console.error('View tracking failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}