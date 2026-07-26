import { canUseDemoLogin } from '../auth/demo-policy';

interface AuthEnvironment {
  NODE_ENV?: string;
  ENABLE_DEMO_LOGIN?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}

export function getAuthCapabilities(environment: AuthEnvironment) {
  const supabase = Boolean(environment.NEXT_PUBLIC_SUPABASE_URL && environment.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const localDemo = canUseDemoLogin(environment);
  return { supabase, localDemo, demo: localDemo };
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) throw new Error('Supabase authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  return { url, publishableKey };
}

export function isDemoLoginEnabled() {
  return canUseDemoLogin(process.env);
}
