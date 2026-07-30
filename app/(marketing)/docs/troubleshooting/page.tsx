import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '../../../../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({ path: '/docs/troubleshooting', title: 'Troubleshooting | Oxiom Invoice Processing', description: 'Troubleshooting guide for common Oxiom Invoice Processing issues. Error messages, solutions, and support resources.' });

const issues = [
  ['Invoice upload fails', 'Unsupported file type, oversized attachment, or unstable network connection.', 'Confirm the file is PDF, JPEG, PNG, or TIFF, reduce file size if needed, and retry from a stable network.'],
  ['Invoice remains in Received status', 'Background processing has not completed.', 'Refresh the queue and escalate if the invoice does not move after the expected processing window.'],
  ['Duplicate warning appears', 'The system detected matching supplier, invoice number, amount, or date information.', 'Review prior records before approving and document any override reason.'],
  ['Missing supplier match', 'Vendor master data may be incomplete.', 'Verify supplier records, update aliases if appropriate, and reprocess.'],
  ['Approval route is incorrect', 'Workflow rules may not align with entity, amount, or coding values.', 'Check routing logic, coding, and threshold configuration.'],
  ['Approver cannot access invoice', 'Role or entity permissions may not include the record.', 'Confirm the user role, scope permissions, and assignment path.'],
  ['Search returns no results', 'Filters may be too narrow or indexing may still be in progress.', 'Clear restrictive filters, search by alternate fields, and retry.'],
  ['Saved search disappeared', 'The view may have been renamed, deleted, or created under another profile.', 'Check personal and shared saved searches, then recreate if needed.'],
  ['Export is incomplete', 'Date ranges, filters, or permissions may be limiting the result set.', 'Verify export criteria and role access before rerunning the report.'],
  ['Status cannot move to Approved', 'A required validation, approval, or exception step is still open.', 'Review invoice history and exception panels to find the blocker.'],
  ['Payment-ready queue is empty', 'Approved invoices may still await downstream validation or posting prerequisites.', 'Confirm final approval is complete and review any ERP blockers.'],
  ['Dashboard metrics look outdated', 'A refresh may be needed or an aggregation job may still be running.', 'Refresh the dashboard and compare against invoice worklists.'],
  ['API request is rejected', 'Authentication, rate limits, or payload validation may have failed.', 'Review API key scope, request structure, and error code guidance.'],
  ['Session times out unexpectedly', 'Security policy or inactivity thresholds may be expiring sessions.', 'Sign in again and ask an administrator to review session settings.'],
  ['Audit history is missing an action', 'The action may not have been committed, or permissions may limit visible history.', 'Refresh the invoice record and confirm role access.'],
  ['SSO login fails', 'Identity-provider configuration or user provisioning may be out of sync.', 'Confirm SSO settings, assigned groups, and user status with IT.'],
];

const codes = [
  ['OX-1001', 'Upload rejected', 'Confirm supported format and retry with a valid invoice file.'],
  ['OX-2004', 'Supplier match not found', 'Review vendor master data and invoice supplier details.'],
  ['OX-3002', 'Approval routing failed', 'Validate workflow thresholds, assignments, and coding fields.'],
  ['OX-4003', 'Export blocked', 'Check permissions and downstream integration availability.'],
  ['OX-5001', 'Unexpected processing error', 'Retry once, gather invoice details, and escalate if the error persists.'],
];

export default function TroubleshootingPage() {
  return <div className="min-h-screen bg-white"><div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"><h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Troubleshooting</h1><p className="max-w-3xl text-lg text-slate-600">Resolve common Oxiom Invoice Processing issues with root-cause guidance, error code references, and clear escalation paths.</p></div></div><div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10"><section className="mb-16"><h2 className="mb-6 text-3xl font-semibold text-slate-950">Common issues and resolutions</h2><div className="grid gap-6 md:grid-cols-2">{issues.map(([title, cause, solution]) => (<div key={title} className="rounded-lg border border-slate-200 bg-white p-6"><h3 className="mb-3 text-xl font-semibold text-slate-950">{title}</h3><p className="mb-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-950">Likely cause:</span> {cause}</p><p className="text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-950">Recommended action:</span> {solution}</p></div>))}</div></section><section className="mb-16"><h2 className="mb-6 text-3xl font-semibold text-slate-950">Error code table</h2><div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600"><thead className="bg-slate-50 text-slate-950"><tr><th className="px-4 py-3 font-semibold">Code</th><th className="px-4 py-3 font-semibold">Meaning</th><th className="px-4 py-3 font-semibold">Resolution</th></tr></thead><tbody className="divide-y divide-slate-200">{codes.map(([code, meaning, resolution]) => (<tr key={code}><td className="px-4 py-3 font-medium text-slate-950">{code}</td><td className="px-4 py-3">{meaning}</td><td className="px-4 py-3">{resolution}</td></tr>))}</tbody></table></div></section><section><h2 className="mb-4 text-3xl font-semibold text-slate-950">Escalation path</h2><p className="mb-6 text-base leading-7 text-slate-600">Start with the guidance above. If an issue affects production processing, gather invoice IDs, user impact, and time of occurrence before contacting support. Standard requests should be sent by email, while enterprise-critical incidents should use the priority phone channel listed in the support hub.</p><div className="grid gap-6 md:grid-cols-3"><Link href="/support" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">Support hub</h3></Link><Link href="/faq" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">FAQ</h3></Link><Link href="/docs/api" className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 text-lg font-semibold text-slate-950">API documentation</h3></Link></div></section></div></div>;
}
