/**
 * services/supabaseClient.js  —  Supabase client singleton
 * ──────────────────────────────────────────────────────────────────
 * Initialized from environment variables so keys are never in source
 * control. The Vite build replaces import.meta.env.* at build time.
 *
 * Set these in your .env file (never commit .env to git):
 *   VITE_SUPABASE_URL=https://your-project-id.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 *
 * Both values are in: Supabase dashboard → Project Settings → API
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "[Kirba Bites] Missing Supabase env vars.\n" +
    "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n" +
    "See supabase_schema.md for setup instructions."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
