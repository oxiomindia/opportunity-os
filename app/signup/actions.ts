'use server';

import { signupErrorMessage, signupExceptionMessage } from '../../lib/auth/signup-error';
import { signupSchema } from '../../lib/auth/signup';
import { getAuthCapabilities } from '../../lib/supabase/config';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export interface SignupState { error?: string; success?: string; fields?: Record<string, string> }

export async function signup(_state: SignupState, formData: FormData): Promise<SignupState> {
  if (!getAuthCapabilities(process.env).supabase) return { error: 'Account creation is not configured for this environment.' };
  const values = Object.fromEntries(formData);
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the highlighted information.' };

  const supabase = await createSupabaseServerClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  try {
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${baseUrl.replace(/\/$/, '')}/auth/callback`,
        data: {
          display_name: parsed.data.fullName,
          phone_number: parsed.data.phone,
          organization_name: parsed.data.organizationName,
        },
      },
    });

    if (error) {
      console.error(JSON.stringify({
        event: 'auth.signup.failed',
        code: error.code ?? null,
        status: error.status,
        message: error.message,
      }));
      return { error: signupErrorMessage(error) };
    }

    if (!data.user || data.user.identities?.length === 0) {
      console.warn(JSON.stringify({ event: 'auth.signup.rejected', reason: 'existing_identity' }));
      return { error: 'An account with this work email already exists. Sign in or reset your password.' };
    }
  } catch (error) {
    const message = signupExceptionMessage(error);
    console.error(JSON.stringify({ event: 'auth.signup.exception', message }));
    return { error: `Account creation could not reach the authentication service: ${message}` };
  }

  return { success: 'Check your work email to verify your account. You must verify it before signing in.' };
}
