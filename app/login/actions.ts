'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { isDemoCredentials } from '../../lib/auth/demo-policy';
import { getAuthCapabilities } from '../../lib/supabase/config';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { createLocalDemoToken, getLocalDemoCookieOptions, localDemoCookie } from '../../lib/auth/dev-session';

export interface LoginState { error?: string }

const loginSchema = z.object({
  username: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(1024),
});

function safeNext(next: FormDataEntryValue | null): string {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ username: formData.get('username'), password: formData.get('password') });
  if (!parsed.success) return { error: 'Enter a valid email address and password.' };
  const { username, password } = parsed.data;
  const destination = safeNext(formData.get('next'));
  const capabilities = getAuthCapabilities(process.env);
  if (!capabilities.supabase && !capabilities.localDemo) return { error: 'Sign in is not configured for this environment.' };
  const email = username;

  if (username === 'admin') {
    if (!capabilities.demo || !isDemoCredentials(process.env, username, password)) return { error: 'Invalid email address or password.' };
    if (capabilities.localDemo) {
      const cookieStore = await cookies();
      cookieStore.set(localDemoCookie.name, await createLocalDemoToken(), getLocalDemoCookieOptions(process.env));
      redirect(destination);
    }
  } else if (!z.email().safeParse(username).success) {
    return { error: 'Enter a valid email address and password.' };
  }

  // Infrastructure-free demo mode has no external identity provider to query.
  // Reject non-demo identities consistently instead of attempting to create an
  // unconfigured Supabase client and turning invalid credentials into a 500.
  if (!capabilities.supabase) return { error: 'Invalid email address or password.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Invalid email address or password.' };
  redirect(destination);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(localDemoCookie.name);
  const capabilities = getAuthCapabilities(process.env);
  if (!capabilities.supabase) redirect('/login');
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getLoginCapabilities() {
  return getAuthCapabilities(process.env);
}
