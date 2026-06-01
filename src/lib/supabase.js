import { createClient } from '@supabase/supabase-js';

// Hardcoded fallbacks so the admin panel works on Vercel without manual env var setup.
// The publishable key is safe to expose — it's meant for client-side use.
const SUPABASE_URL = 'https://welpdrlodvnaszltbaqp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_C4jL2W6Zqd6hvxsRZ6Eodg_Go3zurIg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not set and no hardcoded fallback available. ' +
    'Falling back to mock data from src/data/mockData.js.'
  );
}

/**
 * Supabase client instance.
 * Uses the anonymous/public key for public reads and authenticated writes.
 * Row-Level Security (RLS) policies on the properties/reels tables enforce:
 *  - Anyone can SELECT (read)
 *  - Only authenticated users can INSERT/UPDATE/DELETE
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});