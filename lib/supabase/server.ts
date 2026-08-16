import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for server components, route handlers, and server actions.
 *
 * Must be created per-request (never hoisted to a module-level singleton) —
 * it closes over that request's cookies, so sharing one across requests would
 * leak one user's session into another user's response.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies. This is expected and safe
            // to ignore: proxy.ts refreshes the session cookie on every request,
            // so the token is kept current there instead.
          }
        },
      },
    },
  );
}
