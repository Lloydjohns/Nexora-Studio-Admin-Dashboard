import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Landing point for the link in Supabase's confirmation email.
 *
 * This project has email confirmation switched on (mailer_autoconfirm = false),
 * so signing up does not create a session — the user has to come through here
 * first. Previously this route did not exist, so the confirmation link had
 * nowhere to land.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      // verifyOtp set the session cookies on the response for us.
      return NextResponse.redirect(new URL(next, origin));
    }

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
    );
  }

  return NextResponse.redirect(
    new URL('/login?error=Invalid+or+expired+confirmation+link', origin),
  );
}
