'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';

export default function LoginForm({ demoEnabled, configured }: Readonly<{ demoEnabled: boolean; configured: boolean }>) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="username" className="text-sm font-semibold text-slate-700">Email address or username</label>
        <input id="username" name="username" autoComplete="username" required className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      </div>
      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      {!configured && <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Sign in is not configured for this environment. Add the Supabase URL and anonymous key, then restart the application.</p>}
      <button disabled={pending || !configured} className="h-11 w-full rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      {demoEnabled && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>Development only:</strong> use username <code>admin</code> and password <code>admin</code>. This starts a local Demo Organization session without connecting to Supabase.</p>}
    </form>
  );
}
