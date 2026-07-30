import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '../../lib/auth/dal';
import { getLoginCapabilities } from './actions';
import LoginForm from './LoginForm';
import { NOINDEX } from '../../lib/seo/metadata';

export const metadata: Metadata = {
  title: 'Sign In | Oxiom',
  robots: NOINDEX,
};

function safeNext(next: string | undefined): string | undefined {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : undefined;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const destination = safeNext(next) ?? '/dashboard';
  const capabilities = await getLoginCapabilities();
  if ((capabilities.supabase || capabilities.localDemo) && await getAuthenticatedUser()) redirect(destination);
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Oxiom</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Sign in to Invoice Processing</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Access your organization&apos;s secure accounts payable workspace.</p>
        <LoginForm demoEnabled={capabilities.demo} configured={capabilities.supabase || capabilities.localDemo} next={safeNext(next)} />
      </section>
    </main>
  );
}
