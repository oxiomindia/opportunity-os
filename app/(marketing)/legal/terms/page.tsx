import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '../../../../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({ path: '/legal/terms', title: 'Terms of Service | Oxiom', description: 'Terms of Service for Oxiom Invoice Processing platform. Understand your rights and responsibilities.' });

const sections = [
  ['Acceptance', 'By accessing or using Oxiom Invoice Processing, you agree to these Terms of Service and any order forms or supplemental terms that apply to your subscription.'],
  ['Service Description', 'Oxiom provides software and related services for invoice capture, workflow management, approvals, reporting, and associated finance operations.'],
  ['User Accounts', 'Customers are responsible for maintaining accurate account information, safeguarding credentials, and ensuring that users access the service only as authorized.'],
  ['Acceptable Use', 'You may not use Oxiom to violate law, infringe rights, transmit malicious code, interfere with platform operations, or process data in ways prohibited by contract or applicable regulation.'],
  ['IP Rights', 'Oxiom retains all right, title, and interest in the platform, software, documentation, and related intellectual property. Customers retain their rights in uploaded data, subject to the licenses necessary to host and support the service.'],
  ['Disclaimer', 'Except as expressly stated in a written agreement, the service is provided on an as-available basis and implied warranties are disclaimed to the maximum extent permitted by law.'],
  ['Limitation of Liability', 'To the extent permitted by law, Oxiom will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, and aggregate liability is limited as provided in the governing commercial agreement.'],
  ['Termination', 'Either party may terminate or suspend access as allowed under the applicable subscription agreement, including for material breach, non-payment, legal requirements, or security threats.'],
  ['Governing Law', 'These Terms are governed by the law specified in the controlling customer agreement, unless a different jurisdiction is required by mandatory law.'],
];

export default function TermsPage() {
  return <div className="min-h-screen bg-white"><div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"><h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Terms of Service</h1><p className="max-w-3xl text-lg text-slate-600">These Terms of Service describe the legal framework for accessing and using Oxiom Invoice Processing and related services.</p></div></div><div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10"><div className="space-y-10">{sections.map(([title, body]) => (<section key={title}><h2 className="mb-4 text-2xl font-semibold text-slate-950">{title}</h2><p className="text-base leading-7 text-slate-600">{body}</p></section>))}</div></div><div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10"><div className="grid gap-6 md:grid-cols-3"><Link href="/legal/privacy" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Privacy Policy</h3><p className="text-sm text-slate-600">See how Oxiom handles personal and business data across the platform.</p></Link><Link href="/legal" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Legal index</h3><p className="text-sm text-slate-600">Browse all current Oxiom legal policies in one place.</p></Link><Link href="/support" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Support hub</h3><p className="text-sm text-slate-600">Reach support, compliance, or procurement for contractual questions.</p></Link></div></div></div></div>;
}
