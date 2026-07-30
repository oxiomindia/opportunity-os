import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({ path: '/security', title: 'Security | Oxiom Invoice Processing', description: 'Enterprise security for invoice processing. SOC 2, ISO 27001, encryption, access control, and security practices.' });

const sections = [
  ['Infrastructure Security', 'Oxiom runs on enterprise cloud infrastructure with layered network protections, secure environment management, hardened deployment practices, and continuous monitoring designed to support availability and resilience for finance operations.'],
  ['Data Security', 'Invoice and account data is protected with encryption at rest using AES-256-aligned controls and encryption in transit with TLS 1.3. Sensitive records are stored in access-controlled systems with logging and retention safeguards.'],
  ['Access Control', 'Oxiom supports role-based access control, least-privilege administration, multi-factor authentication readiness, and enterprise identity controls to help customers manage who can see, approve, or export invoice data.'],
  ['Compliance Program', 'Our security program is designed to support enterprise due diligence, including a roadmap toward SOC 2 Type II readiness and alignment with ISO 27001 control domains appropriate to the platform and customer environment.'],
  ['Incident Response', 'Oxiom maintains documented incident-response procedures for identifying, triaging, containing, investigating, communicating, and remediating security events that may affect the platform or customer data.'],
  ['Penetration Testing', 'We assess the platform through vulnerability management practices, security reviews, and periodic testing to identify and address weaknesses before they become material risks to customers.'],
  ['Responsible Disclosure', 'Security researchers and customers can report suspected issues to security@oxiom.ai. We review credible reports promptly and coordinate remediation based on severity and operational impact.'],
];

export default function SecurityPage() {
  return <div className="min-h-screen bg-white"><div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"><h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Security</h1><p className="max-w-3xl text-lg text-slate-600">Oxiom takes a defense-in-depth approach to protecting invoice, financial, and operational data for enterprise customers.</p></div></div><div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10"><div className="space-y-10">{sections.map(([title, body]) => (<section key={title}><h2 className="mb-4 text-2xl font-semibold text-slate-950">{title}</h2><p className="text-base leading-7 text-slate-600">{body}</p></section>))}</div></div><div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10"><div className="grid gap-6 md:grid-cols-3"><Link href="/legal/data-processing" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Data processing policy</h3></Link><Link href="/compliance" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Compliance overview</h3></Link><Link href="/support" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Support hub</h3></Link></div></div></div></div>;
}
