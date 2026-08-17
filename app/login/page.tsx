import { LoginForm } from '@/components/login-form';

/**
 * Reading the query string here on the server (rather than with
 * useSearchParams in the form) lets the login form server-render immediately.
 * With useSearchParams the whole form has to sit behind a Suspense boundary and
 * the first paint is a spinner.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const redirectTo = first(params.redirectTo);

  return (
    <LoginForm
      redirectTo={redirectTo?.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/'}
      urlError={first(params.error) ?? null}
    />
  );
}
