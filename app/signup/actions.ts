'use server';
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
  const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { emailRedirectTo: `${baseUrl.replace(/\/$/, '')}/auth/callback`, data: { display_name: parsed.data.fullName, phone_number: parsed.data.phone, organization_name: parsed.data.organizationName } } });
  if (error || data.user?.identities?.length === 0) return { error: 'Unable to create an account with these details. If you already registered, sign in or reset your password.' };
  return { success: 'Check your work email to verify your account. You must verify it before signing in.' };
}
