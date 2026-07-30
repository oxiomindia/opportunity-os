import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionContext, requireUser } from '../../lib/auth/dal';
import OnboardingForm from './OnboardingForm';
import { NOINDEX } from '../../lib/seo/metadata';

export const metadata: Metadata = { title: 'Create Your Organization | Oxiom', robots: NOINDEX };

export default async function OnboardingPage() {
  await requireUser();
  if (await getSessionContext()) redirect('/dashboard');
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8"><h1 className="text-2xl font-semibold text-slate-950">Create your organization</h1><p className="mt-2 text-sm text-slate-600">This workspace keeps invoices and users isolated from every other organization.</p><OnboardingForm /></section></main>;
}
