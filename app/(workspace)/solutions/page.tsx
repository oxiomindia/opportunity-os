import { Metadata } from 'next';
import Link from 'next/link';

import { SolutionsGrid } from './SolutionPageTemplate';

export const metadata: Metadata = {
  title: 'Invoice Processing Solutions | Oxiom',
  description: 'Enterprise invoice processing and accounts payable automation solutions. AI, OCR, ERP integration, and workflow automation.',
};

const pillars = [
  'Capture and classify incoming invoices',
  'Automate workflow and approvals',
  'Strengthen validation and controls',
  'Improve reporting and audit readiness',
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Invoice processing solutions for enterprise finance teams</h1>
          <p className="max-w-3xl text-lg text-slate-600">Oxiom helps AP, finance, and IT leaders modernize invoice operations with controlled workflows, AI-assisted capture, validation, ERP integration, and analytics.</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mb-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <div key={pillar} className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-950">{pillar}</h2>
            </div>
          ))}
        </div>
        <section className="mb-16">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-slate-950">Browse every solution page</h2>
              <p className="mt-3 max-w-3xl text-lg text-slate-600">Explore solution pages tailored to AP automation, invoice controls, document processing, ERP integration, and finance operations.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/docs" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-950">Read documentation</Link>
              <Link href="/contact" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Talk to sales</Link>
            </div>
          </div>
          <SolutionsGrid />
        </section>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8 lg:px-10">
          <h2 className="mb-4 text-3xl font-semibold text-slate-950">Need a rollout plan for your team?</h2>
          <p className="mb-8 text-lg text-slate-600">Review implementation guidance, security practices, and support resources before you deploy Oxiom across finance operations.</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/docs/implementation" className="rounded-full bg-blue-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-700">View implementation guide</Link>
            <Link href="/support" className="rounded-full border border-slate-300 px-7 py-3.5 text-base font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-950">Visit support hub</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
