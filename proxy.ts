import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from './lib/supabase/config';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let config: ReturnType<typeof getSupabaseConfig>;
  try {
    config = getSupabaseConfig();
  } catch {
    return NextResponse.redirect(new URL('/login?error=configuration', request.url));
  }
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/invoices/:path*', '/upload/:path*', '/verification/:path*', '/reviews/:path*', '/accounts-review/:path*', '/payment-queue/:path*', '/reports/:path*', '/activity/:path*', '/settings/:path*'],
};
