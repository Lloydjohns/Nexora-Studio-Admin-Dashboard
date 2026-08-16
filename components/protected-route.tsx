'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

/**
 * Client-side backstop for auth.
 *
 * proxy.ts already redirects signed-out users before a protected page renders,
 * so by the time this mounts the user is authenticated. Its remaining job is to
 * catch a session that ends *while* the page is open — a sign-out in another
 * tab, or an expired refresh token.
 *
 * It deliberately does not gate rendering on `loading`. Doing so showed a
 * spinner on every single navigation, which was the flash you were seeing.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const signedOut = !loading && !user;

  React.useEffect(() => {
    if (signedOut) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [signedOut, router, pathname]);

  // Only blank out once we know for certain the session is gone.
  if (signedOut) return null;

  return <>{children}</>;
}
