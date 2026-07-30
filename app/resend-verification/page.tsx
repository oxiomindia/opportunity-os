import type { Metadata } from 'next';
import RecoveryForm from '../forgot-password/RecoveryForm';import{resendVerification}from'./actions';import{NOINDEX}from'../../lib/seo/metadata';
export const metadata: Metadata = { title: 'Resend Verification | Oxiom', robots: NOINDEX };
export default function Page(){return <main className="mx-auto max-w-md px-4 py-16"><h1 className="text-2xl font-semibold">Resend verification email</h1><p className="mt-2 text-sm text-slate-600">Request a new verification link for an unverified account.</p><RecoveryForm action={resendVerification} label="Resend verification"/></main>}
