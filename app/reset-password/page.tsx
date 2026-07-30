import type { Metadata } from 'next';
import{redirect}from'next/navigation';import{getAuthenticatedUser}from'../../lib/auth/dal';import ResetForm from'./ResetForm';import{NOINDEX}from'../../lib/seo/metadata';
export const metadata: Metadata = { title: 'Reset Password | Oxiom', robots: NOINDEX };
export default async function Page(){if(!await getAuthenticatedUser())redirect('/forgot-password');return <main className="mx-auto max-w-md px-4 py-16"><h1 className="text-2xl font-semibold">Reset password</h1><ResetForm/></main>}
