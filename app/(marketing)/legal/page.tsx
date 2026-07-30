import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  path: '/legal',
  title: 'Legal | Oxiom Invoice Processing',
  description: 'Legal policies for Oxiom Invoice Processing, including privacy, terms, cookies, and data processing information.',
});

const pages = [
  ['Privacy Policy', 'How Oxiom collects, uses, stores, and protects personal and business data.', '/legal/privacy'],
  ['Terms of Service', 'The contractual terms that govern access to and use of the Oxiom platform.', '/legal/terms'],
  ['Cookie Policy', 'Details about cookies and similar technologies used across the platform.', '/legal/cookies'],
  ['Data Processing Policy', 'How invoice and financial data is processed, retained, and safeguarded.', '/legal/data-processing'],
];

export default function LegalIndexPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"><h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Legal</h1><p className="max-w-3xl text-lg text-slate-600">Review the policies and terms that support privacy, data governance, and platform use across Oxiom Invoice Processing.</p></div></div>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10"><div className="grid gap-6 md:grid-cols-2">{pages.map(([title, description, href]) => (
        <Link key={href} href={href} className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h2 className="mb-3 text-2xl font-semibold text-slate-950">{title}</h2><p className="text-sm leading-6 text-slate-600">{description}</p></Link>
      ))}</div></div>
      <div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-4xl px-6 text-center sm:px-8 lg:px-10"><h2 className="mb-4 text-3xl font-semibold text-slate-950">Need support from security, compliance, or procurement?</h2><p className="mb-8 text-lg text-slate-600">Visit Oxiom support resources for trust documentation, escalation options, and enterprise rollout guidance.</p><div className="flex flex-col items-center justify-center gap-4 sm:flex-row"><Link href="/support" className="rounded-full bg-blue-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-700">Visit support hub</Link><Link href="/security" className="rounded-full border border-slate-300 px-7 py-3.5 text-base font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-950">Review security</Link></div></div></div>
    </div>
  );
}
