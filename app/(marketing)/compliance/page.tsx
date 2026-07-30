import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({ path: '/compliance', title: 'Compliance | Oxiom Billing', description: 'Regulatory compliance for customer billing. GDPR, CCPA, SOX, and audit trail capabilities.' });

const sections = [
  ['GDPR compliance', 'Oxiom supports customers that need lawful processing, access controls, retention governance, and data subject rights workflows aligned to GDPR obligations and related customer contracts.'],
  ['CCPA compliance', 'Our platform and policies are structured to help customers manage service-provider relationships, respond to covered requests, and maintain transparency around data handling in line with CCPA requirements.'],
  ['SOX support', 'Oxiom preserves user actions, invoice status changes, payment records, and void history so finance teams can support internal controls, testing, and external audit requests more efficiently.'],
  ['Financial compliance', 'Invoice workflows can be configured to reflect segregation of duties, status-guarded actions, validation rules, and documentation requirements that support broader finance governance standards.'],
  ['Regulatory reporting', 'Searchable histories, export-ready data, and structured workflows help teams prepare the records required for compliance reviews, policy attestations, and internal reporting demands.'],
  ['Audit log capabilities', 'Oxiom captures a durable, searchable audit history for invoice creation, sending, payment, and void events so teams can reconstruct events with confidence.'],
];

export default function CompliancePage() {
  return <div className="min-h-screen bg-white"><div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"><h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Compliance</h1><p className="max-w-3xl text-lg text-slate-600">Oxiom helps finance teams support privacy, audit, and internal-control requirements while modernizing customer billing.</p></div></div><div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10"><div className="space-y-10">{sections.map(([title, body]) => (<section key={title}><h2 className="mb-4 text-2xl font-semibold text-slate-950">{title}</h2><p className="text-base leading-7 text-slate-600">{body}</p></section>))}</div></div><div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10"><div className="grid gap-6 md:grid-cols-3"><Link href="/security" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Security overview</h3></Link><Link href="/legal/data-processing" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Data processing policy</h3></Link><Link href="/docs/admin" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Administrator guide</h3></Link></div></div></div></div>;
}
