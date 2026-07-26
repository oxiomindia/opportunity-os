import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthenticatedUser } from '../../lib/auth/dal';
import { getLoginCapabilities } from './actions';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const capabilities = await getLoginCapabilities();
  if ((capabilities.supabase || capabilities.localDemo) && await getAuthenticatedUser()) redirect('/dashboard');
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Oxiom</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Sign in to Invoice Processing</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Access your organization&apos;s secure accounts payable workspace.</p>
        <LoginForm demoEnabled={capabilities.demo} configured={capabilities.supabase || capabilities.localDemo} />
        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="mb-3 text-center text-sm text-slate-600">New to Oxiom?</p>
          <Link
            href="/signup"
            className="flex h-11 w-full items-center justify-center rounded-lg border border-blue-600 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Create Account
          </Link>
        </div>
      </section>
    </main>
  );
}
