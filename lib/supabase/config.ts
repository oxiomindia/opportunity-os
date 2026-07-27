import { canUseDemoLogin } from '../auth/demo-policy';

interface AuthEnvironment {
  NODE_ENV?: string;
  ENABLE_DEMO_LOGIN?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_APP_URL?: string;
}

export function getAuthCapabilities(environment: AuthEnvironment) {
  const supabase = Boolean(environment.NEXT_PUBLIC_SUPABASE_URL && environment.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const localDemo = canUseDemoLogin(environment);
  return { supabase, localDemo, demo: localDemo };
}

export function parseSupabaseConfig(environment: AuthEnvironment) {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) throw new Error('Supabase authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');

  let endpoint: URL;
  try {
    endpoint = new URL(url);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be an absolute Supabase project URL.');
  }
  if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be an HTTP(S) Supabase project URL without credentials, query parameters, or a fragment.');
  }
  if (environment.NODE_ENV === 'production' && endpoint.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must use HTTPS in production.');
  }

  if (environment.NEXT_PUBLIC_APP_URL) {
    let appEndpoint: URL;
    try {
      appEndpoint = new URL(environment.NEXT_PUBLIC_APP_URL);
    } catch {
      throw new Error('NEXT_PUBLIC_APP_URL must be an absolute application URL.');
    }
    if (endpoint.origin === appEndpoint.origin) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL points to the application domain instead of the Supabase project.');
    }
  }

  return { url: endpoint.toString().replace(/\/$/, ''), publishableKey };
}

export function getSupabaseConfig() {
  return parseSupabaseConfig(process.env);
}
