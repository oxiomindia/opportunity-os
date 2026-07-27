'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signup, type SignupState } from './actions';

const fields = [
  ['fullName', 'Full Name', 'name'],
  ['email', 'Work Email', 'email'],
  ['phone', 'Mobile Phone Number', 'tel'],
  ['organizationName', 'Organization Name', 'organization'],
  ['password', 'Password', 'new-password'],
  ['confirmPassword', 'Confirm Password', 'new-password'],
] as const;

const inputClass = 'mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition-shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export default function SignupForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(signup, {});

  return (
    <form action={action} className="mt-5 space-y-4">
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        {fields.map(([name, label, autoComplete]) => (
          <div key={name}>
            <label htmlFor={name} className="text-sm font-semibold text-slate-700">{label}</label>
            <input
              id={name}
              name={name}
              type={name.includes('Password') || name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'}
              autoComplete={autoComplete}
              required
              className={inputClass}
              aria-describedby={name === 'phone' ? 'phone-help' : undefined}
            />
            {name === 'phone' && <p id="phone-help" className="mt-1 text-xs leading-4 text-slate-500">Include country code, e.g. +14155552671.</p>}
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <label className="flex items-start gap-2 text-sm leading-5 text-slate-700">
          <input className="mt-0.5 size-4 shrink-0 accent-blue-600" name="acceptTerms" type="checkbox" required />
          <span>I accept the <Link className="font-medium text-blue-700 underline" href="/terms.md" target="_blank">Terms &amp; Conditions</Link>.</span>
        </label>
        <label className="flex items-start gap-2 text-sm leading-5 text-slate-700">
          <input className="mt-0.5 size-4 shrink-0 accent-blue-600" name="acceptPrivacy" type="checkbox" required />
          <span>I accept the <Link className="font-medium text-blue-700 underline" href="/privacy.md" target="_blank">Privacy Policy</Link>.</span>
        </label>
      </div>
      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      {state.success && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{state.success}</p>}
      <button disabled={pending} className="h-10 w-full rounded-lg bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
