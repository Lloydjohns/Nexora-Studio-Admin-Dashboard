```ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/*
 * ============================================================
 * BROWSER SUPABASE CLIENT
 * ============================================================
 *
 * This file is safe to use in Client Components.
 *
 * IMPORTANT:
 *
 * DO NOT add:
 *
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_EMAILS
 *
 * to this file.
 *
 * Both are server-only configuration values.
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabaseConfigured =
  Boolean(
    supabaseUrl &&
      supabasePublishableKey,
  );

const MISSING_ENV_MESSAGE =
  'Supabase is not configured. Copy .env.example to .env.local, fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then restart `npm run dev`.';

/**
 * ============================================================
 * CREATE BROWSER CLIENT
 * ============================================================
 *
 * The browser client uses the public/publishable key.
 *
 * The user's authentication session is stored in cookies so
 * the same session can be used by:
 *
 * - Client Components
 * - proxy.ts
 * - Server Components
 * - Route Handlers
 * - Server Actions
 *
 * NEVER use the service-role key here.
 */
function createClient(): SupabaseClient {
  if (!supabaseConfigured) {
    /*
     * Fail loudly and clearly instead of allowing a component
     * to fail later with an unclear null/undefined error.
     */
    return new Proxy(
      {} as SupabaseClient,
      {
        get() {
          throw new Error(
            MISSING_ENV_MESSAGE,
          );
        },
      },
    );
  }

  return createBrowserClient(
    supabaseUrl as string,
    supabasePublishableKey as string,
  );
}

/*
 * ============================================================
 * EXPORTED BROWSER CLIENT
 * ============================================================
 */

export const supabase: SupabaseClient =
  createClient();
```
