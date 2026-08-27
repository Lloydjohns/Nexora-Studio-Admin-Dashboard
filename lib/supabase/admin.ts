import { createClient } from '@supabase/supabase-js';

/*
 * SERVER-ONLY SUPABASE ADMIN CLIENT
 *
 * IMPORTANT:
 * This file must NEVER be imported into a client component.
 *
 * It uses SUPABASE_SERVICE_ROLE_KEY, which has elevated database
 * privileges and must stay on the server.
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL.',
  );
}

if (!serviceRoleKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY.',
  );
}

/*
 * Do not persist sessions for this admin client.
 *
 * This client is only used for server-side administrative
 * operations such as:
 *
 * - creating Auth users
 * - deleting Auth users
 * - creating team member records
 */
export const supabaseAdmin =
  createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );