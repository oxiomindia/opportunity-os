import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({ path: '/changelog', title: 'Changelog | Oxiom Billing', description: 'Complete changelog for Oxiom Billing. Version history, feature additions, improvements.' });

const releases = [
  {
    version: 'v1.0.0',
    date: '2026-07-25',
    changes: [
      'Launched customer billing: customer management, a product/service catalog, invoice creation and sending, payment tracking, and PDF generation.',
      'Published structured messaging around billing automation, invoice lifecycle, and collections.',
      'Expanded onboarding, troubleshooting, API, and implementation guidance for enterprise buyers and users.',
    ],
  },
  {
    version: 'v0.9.3',
    date: '2026-06-30',
    changes: [
      'Improved invoice list performance and dashboard summary accuracy.',
      'Refined invoice status handling for sent, viewed, partially-paid, and overdue states.',
      'Stabilized search and filter handling for larger invoice datasets.',
    ],
  },
  {
    version: 'v0.9.0',
    date: '2026-05-18',
    changes: [
      'Added broader invoice status support and invoice history visibility.',
      'Expanded invoice detail views with richer operational metadata.',
      'Introduced payment recording workflows for tracking amounts collected.',
    ],
  },
  {
    version: 'v0.8.5',
    date: '2026-03-22',
    changes: [
      'Released beta invoice workflow with creation, line items, and status management foundations.',
      'Added initial dashboard visibility for billing teams and administrators.',
      'Delivered early reporting capabilities for pilot customers.',
    ],
  },
];

export default function ChangelogPage() {
  return <div className="min-h-screen bg-white"><div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"><h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Changelog</h1><p className="max-w-3xl text-lg text-slate-600">Detailed version history for Oxiom Billing, including major feature additions, workflow improvements, and release milestones.</p></div></div><div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10"><div className="space-y-6">{releases.map((release) => (<section key={release.version} className="rounded-lg border border-slate-200 bg-white p-8"><div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-3xl font-semibold text-slate-950">{release.version}</h2><p className="text-sm text-slate-500">{release.date}</p></div><ul className="space-y-3 text-sm leading-6 text-slate-600">{release.changes.map((change) => (<li key={change} className="flex gap-3"><span className="mt-1 text-blue-700">•</span><span>{change}</span></li>))}</ul></section>))}</div></div><div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10"><div className="grid gap-6 md:grid-cols-3"><Link href="/release-notes" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Release notes</h3></Link><Link href="/docs" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Documentation</h3></Link><Link href="/support" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Support</h3></Link></div></div></div></div>;
}
