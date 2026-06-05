import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Fallback values used only at build time when env vars are not set
const url = SUPABASE_URL.startsWith('http') ? SUPABASE_URL : 'https://placeholder.supabase.co';
const key = SUPABASE_KEY.length > 10 ? SUPABASE_KEY : 'placeholder-anon-key-for-build-time-only';

export function createClient() {
  return createBrowserClient(url, key);
}
