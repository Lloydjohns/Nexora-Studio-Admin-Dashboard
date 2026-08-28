import { createClient } from '@supabase/supabase-js';

/*
 * SERVER-ONLY SUPABASE ADMIN CLIENT
 *
 * IMPORTANT:
 *
 * This file must NEVER be imported into:
 *
 * - Client Components
 * - Browser code
 * - Files containing "use client"
 *
 * SUPABASE_SERVICE_ROLE_KEY has full database privileges.
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