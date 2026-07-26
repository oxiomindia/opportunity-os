'use client';

import { useActionState, useState } from 'react';
import { usePathname } from 'next/navigation';
import { feedbackCategories } from '../../../lib/feedback/model';
import { submitFeedback, type FeedbackState } from './actions';

const labels: Record<(typeof feedbackCategories)[number], string> = { 'invoice-upload':'Invoice upload','invoice-review':'Invoice review',dashboard:'Dashboard','search-filters':'Search and filters','approval-workflow':'Approval workflow',reports:'Reports',performance:'Performance','user-interface':'User interface','authentication-access':'Authentication or access','security-privacy':'Security or privacy concern','feature-request':'Feature request',other:'Other' };

export default function FeedbackForm() {
  const pathname = usePathname();
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [clientError, setClientError] = useState('');
  const [state, action, pending] = useActionState<FeedbackState, FormData>(submitFeedback, {});
  if (state.success) return <section role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-6"><h2 className="font-semibold text-emerald-950">Thank you for your feedback. It has been recorded for review by the Oxiom product team.</h2><p className="mt-3 text-sm text-emerald-900">Experiencing a critical operational or security issue? Contact support rather than relying only on this feedback form.</p><button type="button" onClick={() => { setKey(crypto.randomUUID()); window.location.reload(); }} className="mt-4 text-sm font-semibold text-emerald-900 underline">Share more feedback</button></section>;
  const field = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
  return <form action={action} className="space-y-6" onSubmit={(event)=>{const data=new FormData(event.currentTarget);if(`${data.get('pros')??''}${data.get('cons')??''}`.trim().length<10){event.preventDefault();setClientError('Share at least 10 meaningful characters in Pros or Cons.');}else setClientError('');}}>
    <input type="hidden" name="idempotencyKey" value={key}/><input type="hidden" name="sourceRoute" value={pathname}/>
    {(clientError||state.error) && <div role="alert" tabIndex={-1} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{clientError||state.error}</div>}
    <div><label htmlFor="pros" className="font-semibold text-slate-900">Pros — What is working well?</label><p id="pros-help" className="mt-1 text-sm text-slate-600">Tell us which parts of Oxiom are useful, clear, reliable, or valuable in your daily work.</p><textarea id="pros" name="pros" rows={5} maxLength={4000} aria-describedby="pros-help pros-error" className={field}/>{state.fieldErrors?.pros && <p id="pros-error" className="mt-1 text-sm text-red-700">{state.fieldErrors.pros[0]}</p>}</div>
    <div><label htmlFor="cons" className="font-semibold text-slate-900">Cons — What should we improve?</label><p id="cons-help" className="mt-1 text-sm text-slate-600">Tell us about anything confusing, slow, missing, difficult, or not working as expected.</p><textarea id="cons" name="cons" rows={5} maxLength={4000} aria-describedby="cons-help" className={field}/></div>
    <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="category" className="text-sm font-semibold text-slate-900">Feedback category</label><select id="category" name="category" required className={field} defaultValue=""><option value="" disabled>Select a category</option>{feedbackCategories.map((category)=><option key={category} value={category}>{labels[category]}</option>)}</select></div><div><label htmlFor="featureArea" className="text-sm font-semibold text-slate-900">Related feature or page <span className="font-normal text-slate-500">(optional)</span></label><input id="featureArea" name="featureArea" maxLength={120} className={field}/></div></div>
    <fieldset><legend className="text-sm font-semibold text-slate-900">Overall experience <span className="font-normal text-slate-500">(optional; 1 is poor, 5 is excellent)</span></legend><div className="mt-3 flex gap-5">{[1,2,3,4,5].map((rating)=><label key={rating} className="flex items-center gap-2 text-sm"><input type="radio" name="rating" value={rating}/>{rating}</label>)}</div></fieldset>
    <div className="space-y-3"><label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" name="mayContact" className="mt-1"/>May the Oxiom product team contact you about this feedback?</label><label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" name="anonymous" className="mt-1"/>Hide my identity from the product-review team.</label></div>
    <p className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">Feedback is associated with your organization and account so the product team can investigate issues and prevent abuse. When anonymous submission is selected, your identity is hidden from normal product-review views but may remain available to a restricted security administrator when required.</p>
    <button disabled={pending} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{pending?'Recording feedback…':'Submit feedback'}</button>
  </form>;
}
