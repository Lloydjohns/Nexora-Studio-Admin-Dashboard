import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`. Same behaviour, new name —
 * see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 *
 * Two jobs:
 *   1. Refresh the Supabase auth token and write it back onto the response
 *      cookies. Server components cannot set cookies, so without this the
 *      session would silently expire.
 *   2. Redirect signed-out users away from private pages *before* they render,
 *      which is what removes the loading-spinner-then-bounce flash.
 */

// Everything that a signed-out visitor is allowed to reach.
const PUBLIC_ROUTES = ['/login', '/auth'];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Without credentials there is no session to check. Let the request through so
  // the app can render its own "Supabase is not configured" error rather than
  // redirect-looping on /login.
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        // Responses that set auth cookies must never be cached by a CDN,
        // or one user's token could be served to another user.
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
      },
    },
  });

  // Do not put any code between createServerClient and getClaims(). Anything
  // that awaits in between can cause the session to be dropped at random.
  //
  // getClaims() verifies the JWT signature rather than trusting whatever is in
  // the cookie, so its result is safe to make an authorization decision on.
  // getSession() is NOT safe here — it reads storage without revalidating.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;

  if (!isSignedIn && !isPublicRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    // Remember where they were headed so login can send them back.
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isSignedIn && pathname === '/login') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and image files, so the auth token
     * gets refreshed on real navigations but not on every .png request.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
