import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Public Supabase URL and anon key are required for browser uploads.');
}

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
