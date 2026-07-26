'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { signup, type SignupState } from './actions';
const inputClass='mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
export default function SignupForm(){const[state,action,pending]=useActionState<SignupState,FormData>(signup,{});return <form action={action} className="mt-8 space-y-5">
{[['fullName','Full Name','name'],['email','Work Email','email'],['phone','Mobile Phone Number','tel'],['organizationName','Organization Name','organization'],['password','Password','new-password'],['confirmPassword','Confirm Password','new-password']].map(([name,label,auto])=><div key={name}><label htmlFor={name} className="text-sm font-semibold text-slate-700">{label}</label><input id={name} name={name} type={name.toLowerCase().includes('password')?'password':name==='email'?'email':'text'} autoComplete={auto} required className={inputClass} aria-describedby={name==='phone'?'phone-help':undefined}/>{name==='phone'&&<p id="phone-help" className="mt-1 text-xs text-slate-500">Include country code, for example +14155552671.</p>}</div>)}
<label className="flex gap-3 text-sm text-slate-700"><input name="acceptTerms" type="checkbox" required/><span>I accept the <Link className="text-blue-700 underline" href="/terms.md" target="_blank">Terms &amp; Conditions</Link>.</span></label>
<label className="flex gap-3 text-sm text-slate-700"><input name="acceptPrivacy" type="checkbox" required/><span>I accept the <Link className="text-blue-700 underline" href="/privacy.md" target="_blank">Privacy Policy</Link>.</span></label>
{state.error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}{state.success&&<p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{state.success}</p>}
<button disabled={pending} className="h-11 w-full rounded-lg bg-blue-600 font-semibold text-white disabled:opacity-60">{pending?'Creating account…':'Create Account'}</button></form>}
