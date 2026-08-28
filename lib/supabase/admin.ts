import { createClient } from '@supabase/supabase-js';

/*
 * ============================================================
 * SERVER-ONLY SUPABASE ADMIN CLIENT
 * ============================================================
 *
 * IMPORTANT:
 *
 * NEVER import this file into a Client Component.
 *
 * SUPABASE_SERVICE_ROLE_KEY has full database/auth privileges.
 *
 * NEVER use NEXT_PUBLIC_ on the service-role key.
 */

export function createSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

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