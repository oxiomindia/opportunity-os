import type { Metadata } from 'next';
import RecoveryForm from './RecoveryForm';import{requestPasswordReset}from'./actions';import{NOINDEX}from'../../lib/seo/metadata';
export const metadata: Metadata = { title: 'Forgot Password | Oxiom', robots: NOINDEX };
export default function Page(){return <main className="mx-auto max-w-md px-4 py-16"><h1 className="text-2xl font-semibold">Forgot password</h1><p className="mt-2 text-sm text-slate-600">We will send a secure reset link to your work email.</p><RecoveryForm action={requestPasswordReset} label="Send reset link"/></main>}
