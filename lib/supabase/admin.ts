import { createClient } from '@supabase/supabase-js';

/*
 * SERVER-ONLY SUPABASE ADMIN CLIENT
 *
 * IMPORTANT:
 * - This file must only be used by server code.
 * - Never import it into a client component.
 * - SUPABASE_SERVICE_ROLE_KEY must never be exposed to the browser.
 *
 * Environment variables are checked inside the function rather than
 * during module import. This prevents Next.js from failing during
 * build-time page/API route collection.
 */

export function createSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Server Supabase configuration is missing: NEXT_PUBLIC_SUPABASE_URL.',
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Server Supabase configuration is missing: SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}