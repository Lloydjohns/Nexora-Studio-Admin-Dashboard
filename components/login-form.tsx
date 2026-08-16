'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  Loader2,
  MailCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function LoginForm({
  redirectTo = '/',
  urlError = null,
}: {
  /** Where to send the user after a successful sign-in, from ?redirectTo. */
  redirectTo?: string;
  /** Error message passed back by the email-confirmation route, from ?error. */
  urlError?: string | null;
}) {
  const router = useRouter();
  const { user, loading, configError, signIn, signUp } = useAuth();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = React.useState<string | null>(null);

  // Surface errors handed back by the email-confirmation route.
  React.useEffect(() => {
    if (urlError) toast.error(urlError);
  }, [urlError]);

  // proxy.ts already redirects signed-in users away from /login before render.
  // This is the client-side backstop for a sign-in that happens in this tab.
  React.useEffect(() => {
    if (!loading && user) router.replace(redirectTo);
  }, [user, loading, router, redirectTo]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error('Sign in failed', { description: error });
      return;
    }
    toast.success('Welcome back!');
    router.replace(redirectTo);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    const { error, needsEmailConfirmation } = await signUp(email, password);
    setSubmitting(false);

    if (error) {
      toast.error('Sign up failed', { description: error });
      return;
    }

    if (needsEmailConfirmation) {
      // No session yet — redirecting here is what used to bounce the user
      // straight back to this screen.
      setConfirmationSentTo(email);
      toast.success('Check your email to confirm your account.');
      return;
    }

    toast.success('Account created! You are now signed in.');
    router.replace(redirectTo);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 lg:flex">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10">
          <Image
            src="/images/companylogo-transparent.png"
            alt="Nexora Studio — Branding & Design"
            width={400}
            height={268}
            className="h-auto w-52 object-contain brightness-0 invert"
            priority
          />
        </div>

        <div className="relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold leading-tight text-white"
          >
            Run your entire agency from one dashboard.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-white/60"
          >
            Clients, leads, projects, content, finance, and analytics — all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-8"
          >
            {[
              { label: 'Active Clients', value: '18' },
              { label: 'Projects', value: '11' },
              { label: 'Monthly Revenue', value: '₱185K' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          &copy; 2026 Nexora Studio. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Image
              src="/images/companylogo-transparent.png"
              alt="Nexora Studio — Branding & Design"
              width={400}
              height={268}
              className="h-auto w-32 object-contain"
              priority
            />
          </div>

          {configError && (
            <div className="mb-6 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs leading-relaxed text-destructive">{configError}</p>
            </div>
          )}

          {confirmationSentTo ? (
            <div className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MailCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Confirm your email</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a confirmation link to{' '}
                  <span className="font-medium text-foreground">{confirmationSentTo}</span>.
                  Click it to activate your account, then sign in.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setConfirmationSentTo(null)}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to your dashboard or create a new account.
              </p>

              <Tabs defaultValue="signin" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="signin-email" className="mb-1.5 block text-xs">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@nexorastudio.ph"
                          className="pl-9"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="signin-password" className="mb-1.5 block text-xs">Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="signup-email" className="mb-1.5 block text-xs">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@nexorastudio.ph"
                          className="pl-9"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="signup-password" className="mb-1.5 block text-xs">Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          autoComplete="new-password"
                          placeholder="At least 6 characters"
                          className="pl-9"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      Create Account
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground">
                      Only @nexorastudio.ph email addresses can register.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to Nexora Studio&apos;s terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
