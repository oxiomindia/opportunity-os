import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '../../lib/auth/dal';
import SignupForm from './SignupForm';

export default async function SignupPage() {
  if (await getAuthenticatedUser()) redirect('/dashboard');

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-5 sm:px-6 sm:py-6">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Oxiom</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Create your Oxiom account</h1>
        <p className="mt-1 text-sm leading-5 text-slate-600">Verify your work email to create your organization workspace.</p>
        <SignupForm />
        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link className="font-semibold text-blue-700 hover:text-blue-800 hover:underline" href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
