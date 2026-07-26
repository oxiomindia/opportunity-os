import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Administrator Guide | Oxiom Invoice Processing', description: 'Administrator guide for Oxiom Invoice Processing. User management, configuration, workflows, integrations.' };

const roles = [
  ['Admin', 'Full configuration access, user administration, workflow setup, security settings, and audit review.'],
  ['Approver', 'Can review, approve, reject, and comment on invoices routed through defined approval workflows.'],
  ['Reviewer', 'Can validate invoice data, resolve exceptions, and prepare invoices for approval or payment readiness.'],
  ['Viewer', 'Read-only visibility into invoices, dashboards, and permitted reports without workflow action privileges.'],
];

const sections = [
  ['User Management', 'Administrators can add users, assign roles, manage access by business unit or entity, and coordinate onboarding or offboarding with internal identity and security teams.'],
  ['Workflow Configuration', 'Set approval routing rules, escalation policies, spend thresholds, and conditional review steps to reflect finance policy and operating structure.'],
  ['Custom Fields and validation rules', 'Extend invoice records with business-specific fields, enforce required values, and configure validation logic that keeps incomplete or high-risk invoices from moving forward unchecked.'],
  ['Integration Setup', 'Coordinate ERP connections, API keys, master data alignment, and export mappings so approved invoices can move downstream cleanly and consistently.'],
  ['Data Management', 'Define retention settings, archiving rules, and export procedures that match legal, regulatory, and internal records-management requirements.'],
  ['Audit Log access', 'Use system and invoice-level audit history to review user actions, workflow changes, approvals, exceptions, and configuration updates when supporting auditors or internal controls teams.'],
  ['System configuration settings', 'Maintain environment-wide settings for queue behavior, notifications, workflow defaults, and operational controls that affect all users in the tenant.'],
  ['Security settings', 'Coordinate MFA, SSO, session policies, and role governance with IT and security stakeholders to keep platform access aligned with enterprise standards.'],
];

export default function AdminGuidePage() {
  return <div className="min-h-screen bg-white"><div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"><h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Administrator Guide</h1><p className="max-w-3xl text-lg text-slate-600">Configure users, roles, workflows, integrations, and security controls for a stable Oxiom Invoice Processing deployment.</p></div></div><div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10"><section className="mb-16"><h2 className="mb-6 text-3xl font-semibold text-slate-950">Roles & Permissions matrix</h2><div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600"><thead className="bg-slate-50 text-slate-950"><tr><th className="px-4 py-3 font-semibold">Role</th><th className="px-4 py-3 font-semibold">Primary access</th></tr></thead><tbody className="divide-y divide-slate-200">{roles.map(([role, access]) => (<tr key={role}><td className="px-4 py-3 font-medium text-slate-950">{role}</td><td className="px-4 py-3">{access}</td></tr>))}</tbody></table></div></section><section className="space-y-10">{sections.map(([title, body]) => (<div key={title}><h2 className="mb-4 text-2xl font-semibold text-slate-950">{title}</h2><p className="text-base leading-7 text-slate-600">{body}</p></div>))}</section></div><div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10"><div className="grid gap-6 md:grid-cols-3"><Link href="/docs/implementation" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Implementation guide</h3></Link><Link href="/compliance" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Compliance overview</h3></Link><Link href="/support" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Support</h3></Link></div></div></div></div>;
}
