// Shared Supabase client for the client portal.
// The URL and publishable key are meant to be public: every table is protected by row level security
// (see supabase/migrations). Never put the Supabase secret key or any other secret in this folder.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

const SUPABASE_URL = "https://wevvvgbkzoodelvadrlq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LkCbdEcNFHo6KRndOr2Wwg_lA5p1LNm";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

// Absolute URL of a page next to this one, so redirects work on localhost and on GitHub Pages
export const pageUrl = name => new URL(name, location.href).href;
