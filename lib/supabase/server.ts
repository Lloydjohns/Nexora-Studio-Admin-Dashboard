import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * ============================================================
 * SERVER SUPABASE CLIENT
 * ============================================================
 *
 * Used by:
 * - Server Components
 * - Route Handlers
 * - Server Actions
 *
 * This client uses the currently logged-in user's session.
 *
 * It DOES NOT use the service-role key.
 */

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Supabase configuration is missing: NEXT_PUBLIC_SUPABASE_URL.',
    );
  }

  if (!supabasePublishableKey) {
    throw new Error(
      'Supabase configuration is missing: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    );
  }

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                cookieStore.set(
                  name,
                  value,
                  options,
                );
              },
            );
          } catch {
            /*
             * Server Components cannot always
             * write cookies.
             *
             * proxy.ts is responsible for
             * refreshing the session.
             */
          }
        },
      },
    },
  );
}