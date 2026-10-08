import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const { count, error: countError } = await supabaseAdmin
    .from('admin_users')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Admin setup status check failed:', countError.message);
    return NextResponse.json({ error: 'Could not verify setup status' }, { status: 500 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Setup already complete. This route is disabled.' },
      { status: 403 }
    );
  }

  if (!process.env.ADMIN_SETUP_KEY) {
    return NextResponse.json({ error: 'Admin setup is not configured' }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { setupKey, email, password, name } = payload as {
    setupKey?: unknown;
    email?: unknown;
    password?: unknown;
    name?: unknown;
  };

  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
  }

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert({
      email: email.trim().toLowerCase(),
      password_hash,
      name: typeof name === 'string' && name.trim() ? name.trim() : 'Admin',
      role: 'admin',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    user: { id: data.id, email: data.email },
  });
}