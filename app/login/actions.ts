'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { isDemoCredentials, provisionDemoAccount } from '../../lib/auth/demo';
import { isDemoLoginEnabled } from '../../lib/supabase/config';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export interface LoginState { error?: string }

const loginSchema = z.object({
  username: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(1024),
});

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ username: formData.get('username'), password: formData.get('password') });
  if (!parsed.success) return { error: 'Enter a valid email address and password.' };
  const { username, password } = parsed.data;
  let email = username;

  if (username === 'admin') {
    if (!isDemoCredentials(username, password)) return { error: 'Invalid email address or password.' };
    try {
      ({ email } = await provisionDemoAccount());
    } catch (error) {
      console.error('Demo provisioning failed', error);
      return { error: 'The development demo could not be provisioned. Check the local Supabase configuration.' };
    }
  } else if (!z.email().safeParse(username).success) {
    return { error: 'Enter a valid email address and password.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Invalid email address or password.' };
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getLoginCapabilities() {
  return { demo: isDemoLoginEnabled() };
}
