'use client';
import { useActionState } from 'react';
import { createOrganization, type OnboardingState } from './actions';
export default function OnboardingForm() {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(createOrganization, {});
  return <form action={action} className="mt-6 space-y-4">
    <div><label htmlFor="name" className="text-sm font-semibold text-slate-700">Organization name</label><input id="name" name="name" required minLength={2} maxLength={100} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3" /></div>
    {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
    <button disabled={pending} className="h-11 w-full rounded-lg bg-blue-600 font-semibold text-white disabled:opacity-60">{pending ? 'Creating…' : 'Create organization'}</button>
  </form>;
}
