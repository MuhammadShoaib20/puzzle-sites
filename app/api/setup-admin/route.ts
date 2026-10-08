import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const { setupKey, email, password, name } = await req.json();

  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert({ email, password_hash, name: name || 'Admin', role: 'admin' })
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