import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '../../lib/auth/dal';
import { getLoginCapabilities } from './actions';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  if (await getAuthenticatedUser()) redirect('/dashboard');
  const { demo } = await getLoginCapabilities();
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Oxiom</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Sign in to Invoice Processing</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Access your organization&apos;s secure accounts payable workspace.</p>
        <LoginForm demoEnabled={demo} />
      </section>
    </main>
  );
}
