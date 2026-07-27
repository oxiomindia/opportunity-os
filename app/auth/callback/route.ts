import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next');
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : null;
  if (!code) return NextResponse.redirect(new URL('/login?error=verification', request.url));

  const supabase = await createSupabaseServerClient();
  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error(JSON.stringify({ event: 'auth.callback.exchange_failed', code: error.code ?? null, message: error.message }));
    return NextResponse.redirect(new URL('/login?error=verification', request.url));
  }
  if (safeNext) return NextResponse.redirect(new URL(safeNext, request.url));

  const { error: onboardingError } = await supabase.rpc('complete_signup_onboarding');
  if (onboardingError) {
    const reference = crypto.randomUUID();
    console.error(JSON.stringify({
      event: 'auth.callback.onboarding_failed',
      reference,
      userId: sessionData.user?.id ?? null,
      code: onboardingError.code ?? null,
      message: onboardingError.message,
      details: onboardingError.details ?? null,
      hint: onboardingError.hint ?? null,
    }));
    const onboardingUrl = new URL('/onboarding', request.url);
    onboardingUrl.searchParams.set('error', 'completion');
    onboardingUrl.searchParams.set('reference', reference);
    return NextResponse.redirect(onboardingUrl);
  }
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
