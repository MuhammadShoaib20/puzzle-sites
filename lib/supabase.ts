import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

// Public client - browser + server dono me use hoga
// Sirf published content read kar sakta hai (RLS ke through)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client - SIRF server-side use karo (API routes, server components)
// RLS bypass karta hai - full read/write access
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});