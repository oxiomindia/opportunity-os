'use client';

import { useState } from 'react';
import type { Product } from '../../../lib/products/types';
import { getProductDisplayName } from '../../../lib/products/types';

const salesEmail = 'oxiomindia@gmail.com';
const employeeRanges = ['1–10', '11–50', '51–200', '201–500', '500+'];

export default function TrialRequestForm({
  product,
  otherProducts,
  isTrialEligible,
}: Readonly<{ product?: Product; otherProducts: Product[]; isTrialEligible: boolean }>) {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [employees, setEmployees] = useState(employeeRanges[0]);
  const [productRequested, setProductRequested] = useState(product?.id ?? otherProducts[0]?.id ?? '');

  const selectedProduct = product ?? otherProducts.find((entry) => entry.id === productRequested);
  const actionLabel = isTrialEligible ? 'Request Free 7-Day Trial' : 'Register Interest';

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const productName = selectedProduct ? getProductDisplayName(selectedProduct) : 'Oxiom';
    const subject = isTrialEligible ? `Trial request: ${productName}` : `Early interest: ${productName}`;
    const body = [
      `Hi Oxiom team,`,
      ``,
      isTrialEligible
        ? `I'd like to request a free 7-day trial of ${productName}.`
        : `I'd like to register interest in ${productName} and be notified as it becomes available.`,
      ``,
      `Company name: ${companyName}`,
      `Contact person: ${contactPerson}`,
      `Business email: ${email}`,
      `Mobile number: ${mobile}`,
      `City: ${city}`,
      `Country: ${country}`,
      `Number of employees: ${employees}`,
      `Product requested: ${productName}`,
    ].join('\n');
    window.location.href = `mailto:${salesEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm">
      <p className="text-sm font-semibold text-slate-950">Tell us about your business</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        We review each request before activating access — this opens a pre-filled email to our team with your details. We typically respond within one business day.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-slate-800">Company name</span>
          <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={200} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Acme Inc." />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Contact person</span>
          <input required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} maxLength={200} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Full name" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Business email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={320} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="you@company.com" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Mobile number</span>
          <input required type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={32} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="+1 555 000 0000" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Number of employees</span>
          <select value={employees} onChange={(e) => setEmployees(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            {employeeRanges.map((range) => <option key={range} value={range}>{range}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">City</span>
          <input required value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">Country</span>
          <input required value={country} onChange={(e) => setCountry(e.target.value)} maxLength={100} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        {product ? (
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-800">Product requested</span>
            <input readOnly value={getProductDisplayName(product)} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-800">Product requested</span>
            <select value={productRequested} onChange={(e) => setProductRequested(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              {otherProducts.map((entry) => <option key={entry.id} value={entry.id}>{getProductDisplayName(entry)}</option>)}
            </select>
          </label>
        )}
      </div>

      <button type="submit" className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
        {actionLabel}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        Prefer to email directly? <a href={`mailto:${salesEmail}`} className="font-semibold text-blue-700 hover:text-blue-800">{salesEmail}</a>
      </p>
    </form>
  );
}
