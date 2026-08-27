import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Server Supabase configuration is missing: NEXT_PUBLIC_SUPABASE_URL',
  );
}

if (!serviceRoleKey) {
  throw new Error(
    'Server Supabase configuration is missing: SUPABASE_SERVICE_ROLE_KEY',
  );
}

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