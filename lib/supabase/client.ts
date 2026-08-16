'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

const MISSING_ENV_MESSAGE =
  'Supabase is not configured. Copy .env.example to .env.local, fill in ' +
  'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then restart `npm run dev`.';

/**
 * Browser Supabase client. Unlike `createClient` from supabase-js, this stores
 * the session in **cookies** rather than localStorage, so the same session is
 * visible to `proxy.ts` and to server components. That is what lets us block
 * signed-out users before a protected page ever renders.
 */
function createClient(): SupabaseClient {
  if (!supabaseConfigured) {
    // Fail loudly and legibly instead of throwing "cannot read properties of null"
    // from whichever component happened to touch the client first.
    return new Proxy({} as SupabaseClient, {
      get() {
        throw new Error(MISSING_ENV_MESSAGE);
      },
    });
  }

  return createBrowserClient(supabaseUrl as string, supabasePublishableKey as string);
}

export const supabase: SupabaseClient = createClient();
