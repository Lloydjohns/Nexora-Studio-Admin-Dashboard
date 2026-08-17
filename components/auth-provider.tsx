'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '@/lib/supabase/client';

interface SignUpResult {
  error: string | null;
  /**
   * True when the account was created but Supabase is waiting on the user to
   * click the confirmation link, so no session exists yet. The login screen
   * must not pretend the user is signed in in this case.
   */
  needsEmailConfirmation: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Null unless the Supabase env vars are missing, in which case this explains it. */
  configError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const CONFIG_ERROR =
  'Supabase is not configured. Copy .env.example to .env.local, fill in your ' +
  'project URL and publishable key, then restart the dev server.';

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  configError: null,
  signIn: async () => ({ error: 'Not initialized' }),
  signUp: async () => ({ error: 'Not initialized', needsEmailConfirmation: false }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  // When Supabase isn't configured there is nothing to wait for, so don't start
  // in a loading state that would never resolve and hang the whole app.
  const [loading, setLoading] = React.useState(supabaseConfigured);

  React.useEffect(() => {
    if (!supabaseConfigured) return;

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        // Never leave the app stuck on a spinner because a network call failed.
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      // The session lives in cookies now, so the server needs to re-render to
      // see a sign-in or sign-out. Without this, proxy.ts and any server
      // component keep serving the previous auth state.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = React.useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured) return { error: CONFIG_ERROR };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = React.useCallback(
    async (email: string, password: string, fullName: string): Promise<SignUpResult> => {
      if (!supabaseConfigured) {
        return { error: CONFIG_ERROR, needsEmailConfirmation: false };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Where the link in the confirmation email sends the user back to.
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          // This is used only for display and personalization; authorization
          // decisions must never rely on editable user metadata.
          data: { full_name: fullName },
        },
      });

      if (error) return { error: error.message, needsEmailConfirmation: false };

      // This project has email confirmation enabled, so signUp succeeds without
      // returning a session. Treating that as "signed in" is what caused the
      // bounce back to /login.
      return { error: null, needsEmailConfirmation: !data.session };
    },
    [],
  );

  const signOut = React.useCallback(async () => {
    if (!supabaseConfigured) return;
    await supabase.auth.signOut();
    router.refresh();
  }, [router]);

  const value = React.useMemo(
    () => ({
      user,
      session,
      loading,
      configError: supabaseConfigured ? null : CONFIG_ERROR,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
