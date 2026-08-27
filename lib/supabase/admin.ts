import { createClient } from '@supabase/supabase-js';

/*
 * SERVER-ONLY SUPABASE ADMIN CLIENT
 *
 * Never import this file into a client component.
 *
 * The service-role key must NEVER use NEXT_PUBLIC_.
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