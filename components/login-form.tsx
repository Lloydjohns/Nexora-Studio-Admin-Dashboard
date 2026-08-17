'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type FieldProps = {
  label: string;
  id: string;
  type: 'email' | 'password' | 'text';
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
};

export function LoginForm({
  redirectTo = '/',
  urlError = null,
}: {
  redirectTo?: string;
  urlError?: string | null;
}) {
  const router = useRouter();
  const { user, loading, configError, signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = React.useState<string | null>(null);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
  const passwordIsStrong = Object.values(passwordChecks).every(Boolean);

  React.useEffect(() => {
    if (urlError) toast.error(urlError);
  }, [urlError]);

  React.useEffect(() => {
    if (!loading && user) router.replace(redirectTo);
  }, [loading, redirectTo, router, user]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      toast.error('Sign in failed', { description: error });
      return;
    }

    router.replace(redirectTo);
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!passwordIsStrong) {
      toast.error('Choose a stronger password');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Please accept the terms to create an account');
      return;
    }

    setSubmitting(true);
    const { error, needsEmailConfirmation } = await signUp(email, password, fullName.trim());
    setSubmitting(false);

    if (error) {
      toast.error('Account creation failed', { description: error });
      return;
    }
    if (needsEmailConfirmation) {
      setConfirmationSentTo(email);
      return;
    }

    router.replace(redirectTo);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const isSignUp = activeTab === 'signup';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 dark:bg-slate-950 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {configError && (
          <div className="mb-6 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs leading-relaxed text-destructive">{configError}</p>
          </div>
        )}

        {confirmationSentTo ? (
          <ConfirmationScreen email={confirmationSentTo} onBack={() => setConfirmationSentTo(null)} />
        ) : (
          <>
            <div className="mb-7">
              <p className="text-sm font-medium text-primary">Nexora Studio</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isSignUp
                  ? 'Set up your secure workspace access in just a few details.'
                  : 'Sign in with your work email to continue to your workspace.'}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="mt-5 space-y-4">
                  <Field
                    label="Work email"
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@nexorastudio.ph"
                  />
                  <Field
                    label="Password"
                    id="signin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Enter your password"
                  />
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Sign in securely
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="mt-5 space-y-4">
                  <Field
                    label="Full name"
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={setFullName}
                    placeholder="Your full name"
                  />
                  <Field
                    label="Work email"
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@nexorastudio.ph"
                    hint="Use your approved company email address."
                  />
                  <Field
                    label="Create a password"
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Create a strong password"
                  />
                  <PasswordRequirements checks={passwordChecks} />
                  <Field
                    label="Confirm password"
                    id="signup-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Re-enter your password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match yet.</p>
                  )}
                  <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      className="mt-1 h-3.5 w-3.5 rounded border-input accent-primary"
                    />
                    <span>I agree to the terms of service and privacy policy.</span>
                  </label>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Create secure account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}

        <div className="mt-7 flex items-center justify-center gap-2 border-t pt-5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Your account is protected with secure authentication.
        </div>
      </section>
    </main>
  );
}

function Field({ label, id, type, autoComplete, value, onChange, placeholder, hint }: FieldProps) {
  const Icon = type === 'email' ? Mail : type === 'text' ? User : Lock;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-xs">{label}</Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pl-9"
          required
        />
      </div>
    </div>
  );
}

function PasswordRequirements({ checks }: { checks: Record<string, boolean> }) {
  const requirements = [
    { label: 'At least 8 characters', passed: checks.length },
    { label: 'One uppercase letter', passed: checks.uppercase },
    { label: 'One number', passed: checks.number },
  ];

  return (
    <div className="grid gap-1 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground sm:grid-cols-3">
      {requirements.map((requirement) => (
        <div key={requirement.label} className={requirement.passed ? 'flex items-center gap-1.5 text-primary' : 'flex items-center gap-1.5'}>
          {requirement.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {requirement.label}
        </div>
      ))}
    </div>
  );
}

function ConfirmationScreen({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MailCheck className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Open it to activate your account.
        </p>
      </div>
      <Button variant="outline" className="w-full" onClick={onBack}>Back to sign in</Button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading your workspace</p>
      </div>
    </main>
  );
}
