'use client';

import * as React from 'react';
import type { Provider } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, Facebook, Loader2, Lock, Mail, MailCheck, Music2, UserPlus } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type SocialProvider = { label: string; provider: Provider; icon: React.ReactNode };

const socialProviders: SocialProvider[] = [
  { label: 'Google', provider: 'google', icon: <span className="font-semibold text-red-500">G</span> },
  { label: 'Facebook', provider: 'facebook', icon: <Facebook className="h-4 w-4 text-blue-600" /> },
  { label: 'TikTok', provider: 'custom:tiktok' as Provider, icon: <Music2 className="h-4 w-4" /> },
];

export function LoginForm({ redirectTo = '/', urlError = null }: { redirectTo?: string; urlError?: string | null }) {
  const router = useRouter();
  const { user, loading, configError, signIn, signInWithOAuth, signUp } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [socialProvider, setSocialProvider] = React.useState<string | null>(null);
  const [confirmationSentTo, setConfirmationSentTo] = React.useState<string | null>(null);

  React.useEffect(() => { if (urlError) toast.error(urlError); }, [urlError]);
  React.useEffect(() => { if (!loading && user) router.replace(redirectTo); }, [user, loading, router, redirectTo]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) return toast.error('Sign in failed', { description: error });
    router.replace(redirectTo);
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setSubmitting(true);
    const { error, needsEmailConfirmation } = await signUp(email, password);
    setSubmitting(false);
    if (error) return toast.error('Sign up failed', { description: error });
    if (needsEmailConfirmation) return setConfirmationSentTo(email);
    router.replace(redirectTo);
  };

  const handleSocialSignIn = async (provider: SocialProvider) => {
    setSocialProvider(provider.label);
    const { error } = await signInWithOAuth(provider.provider, redirectTo);
    if (!error) return;
    setSocialProvider(null);
    toast.error(`${provider.label} sign in is unavailable`, {
      description: provider.label === 'TikTok' ? 'Enable a custom Supabase OAuth provider named custom:tiktok first.' : error,
    });
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950"><div className="flex flex-col items-center gap-4 text-center"><Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden="true" /><p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading your workspace</p></div></main>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 dark:bg-slate-950 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {configError && <div className="mb-6 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /><p className="text-xs leading-relaxed text-destructive">{configError}</p></div>}
        {confirmationSentTo ? (
          <div className="space-y-5"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><MailCheck className="h-5 w-5" /></div><div><h1 className="text-2xl font-semibold tracking-tight">Check your email</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">We sent a confirmation link to <span className="font-medium text-foreground">{confirmationSentTo}</span>.</p></div><Button variant="outline" className="w-full" onClick={() => setConfirmationSentTo(null)}>Back to sign in</Button></div>
        ) : <>
          <div className="mb-7"><p className="text-sm font-medium text-primary">Nexora Studio</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome back</h1><p className="mt-2 text-sm text-muted-foreground">Sign in to continue to your workspace.</p></div>
          <div className="space-y-3">{socialProviders.map((provider) => <Button key={provider.label} type="button" variant="outline" className="w-full justify-center gap-2 bg-transparent" disabled={submitting || socialProvider !== null} onClick={() => handleSocialSignIn(provider)}>{socialProvider === provider.label ? <Loader2 className="h-4 w-4 animate-spin" /> : provider.icon}Continue with {provider.label}</Button>)}</div>
          <div className="my-6 flex items-center gap-3" aria-hidden="true"><div className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">or use email</span><div className="h-px flex-1 bg-border" /></div>
          <Tabs defaultValue="signin"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="signin">Sign in</TabsTrigger><TabsTrigger value="signup">Create account</TabsTrigger></TabsList>
            <TabsContent value="signin"><form onSubmit={handleSignIn} className="mt-5 space-y-4"><Field label="Email" id="signin-email" type="email" autoComplete="email" value={email} onChange={setEmail} /><Field label="Password" id="signin-password" type="password" autoComplete="current-password" value={password} onChange={setPassword} /><Button type="submit" className="w-full" disabled={submitting || socialProvider !== null}>{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}Sign in</Button></form></TabsContent>
            <TabsContent value="signup"><form onSubmit={handleSignUp} className="mt-5 space-y-4"><Field label="Email" id="signup-email" type="email" autoComplete="email" value={email} onChange={setEmail} /><Field label="Password" id="signup-password" type="password" autoComplete="new-password" value={password} onChange={setPassword} placeholder="At least 6 characters" /><Button type="submit" className="w-full" disabled={submitting || socialProvider !== null}>{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}Create account</Button></form></TabsContent>
          </Tabs>
        </>}
        <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">By continuing, you agree to Nexora Studio&apos;s terms and privacy policy.</p>
      </section>
    </main>
  );
}

function Field({ label, id, type, autoComplete, value, onChange, placeholder }: { label: string; id: string; type: 'email' | 'password'; autoComplete: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  const Icon = type === 'email' ? Mail : Lock;
  return <div><Label htmlFor={id} className="mb-1.5 block text-xs">{label}</Label><div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id={id} type={type} autoComplete={autoComplete} placeholder={placeholder ?? (type === 'email' ? 'you@example.com' : '••••••••')} className="pl-9" value={value} onChange={(event) => onChange(event.target.value)} required /></div></div>;
}
