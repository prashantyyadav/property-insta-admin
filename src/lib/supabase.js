import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY) not set. ' +
    'Falling back to mock data from src/data/mockData.js. ' +
    'Copy .env.example to .env and fill in your Supabase project values.'
  );
}

/**
 * Supabase client instance.
 * Uses the anonymous/public key for public reads and authenticated writes.
 * Row-Level Security (RLS) policies on the properties/reels tables enforce:
 *  - Anyone can SELECT (read)
 *  - Only authenticated users can INSERT/UPDATE/DELETE
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;