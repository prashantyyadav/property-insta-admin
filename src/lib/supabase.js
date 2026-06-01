import { createClient } from '@supabase/supabase-js';

// Hardcoded fallbacks so the admin panel works on Vercel without manual env var setup.
// The anon key is safe to expose — it's meant for client-side use.
const SUPABASE_URL = 'https://ioblbfugnhtghvxbyeos.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvYmxiZnVnbmh0Z2h2eGJ5ZW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTM2NzcsImV4cCI6MjA5NTUyOTY3N30.fyCOdUh5M4x4KeLaEG6Apsfe6U2AvT0acm1a5_JSBQA';

// Debug: confirm which project we're hitting
console.log('[Supabase] Connecting to project:', SUPABASE_URL);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Falling back to mock data.');
}

/**
 * Supabase client instance.
 * Uses the anonymous key for public reads and authenticated writes.
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