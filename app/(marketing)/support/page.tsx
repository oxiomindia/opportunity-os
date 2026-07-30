import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support | Oxiom Invoice Processing',
  description: 'Get help with Oxiom Invoice Processing. Browse documentation, FAQs, or contact our support team.',
};

const columns = [
  ['Documentation', 'Find implementation guides, API references, and operational best practices.', '/docs', 'Browse documentation'],
  ['FAQ', 'Get quick answers about onboarding, workflows, security, and support coverage.', '/faq', 'Read the FAQ'],
  ['Contact Support', 'Open a conversation for product issues, rollout help, or enterprise account questions.', '/contact', 'Contact our team'],
];

const resources = [
  ['Documentation hub', '/docs', 'Start from the complete Oxiom documentation index.'],
  ['Frequently asked questions', '/faq', 'Review common product and rollout questions.'],
  ['Getting started guide', '/docs/getting-started', 'Launch your first invoice workflow in under 30 minutes.'],
  ['Troubleshooting guide', '/docs/troubleshooting', 'Resolve common workflow, upload, and access issues.'],
];

const channels = [
  ['Email support', 'support@oxiom.ai', 'Best for technical questions and ticket details.', 'Response target: within 1 business day'],
  ['Enterprise support line', '+1 (555) 014-9028', 'Use for urgent production-impacting issues and executive escalations.', 'Critical response target: within 1 hour'],
];

const tiers = [
  ['Standard', 'Included for all Oxiom Invoice Processing customers.', 'Business-hours support with a 1 business day response target for normal-priority tickets and best-effort same-day triage for urgent blockers.'],
  ['Enterprise', 'For customers with premium support and expanded governance needs.', 'Priority routing, named contacts, proactive service reviews, and 24/7 response coverage for business-critical incidents with formal SLA management.'],
];

const trust = [
  ['Security overview', '/security'],
  ['Compliance overview', '/compliance'],
  ['Privacy policy', '/legal/privacy'],
  ['Data processing policy', '/legal/data-processing'],
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">How can we help?</h1>
          <p className="max-w-3xl text-lg text-slate-600">Use the Oxiom support hub to find product guidance, resolve common issues, and reach the right team for your environment.</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
        <section className="mb-16 grid gap-6 md:grid-cols-3">
          {columns.map(([title, description, href, cta]) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-2xl font-semibold text-slate-950">{title}</h2>
              <p className="mb-6 text-sm leading-6 text-slate-600">{description}</p>
              <Link href={href} className="font-semibold text-blue-700 hover:text-blue-800">{cta} →</Link>
            </div>
          ))}
        </section>
        <section className="mb-16">
          <h2 className="mb-4 text-3xl font-semibold text-slate-950">Self-service resources</h2>
          <p className="mb-8 max-w-3xl text-lg text-slate-600">Help your AP team solve routine questions faster with curated onboarding, product, and troubleshooting resources.</p>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {resources.map(([title, href, description]) => (
              <Link key={href} href={href} className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50">
                <h3 className="mb-3 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="text-sm leading-6 text-slate-600">{description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="mb-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-semibold text-slate-950">Support channels</h2>
            <div className="space-y-6">
              {channels.map(([title, contact, detail, response]) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <h3 className="mb-2 text-xl font-semibold text-slate-950">{title}</h3>
                  <p className="mb-2 font-medium text-blue-700">{contact}</p>
                  <p className="mb-3 text-sm leading-6 text-slate-600">{detail}</p>
                  <p className="text-sm font-medium text-slate-700">{response}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-6 text-3xl font-semibold text-slate-950">Support tiers and service levels</h2>
            <div className="space-y-6">
              {tiers.map(([title, audience, sla]) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="mb-2 text-xl font-semibold text-slate-950">{title}</h3>
                  <p className="mb-3 text-sm font-medium text-blue-700">{audience}</p>
                  <p className="text-sm leading-6 text-slate-600">{sla}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="border-y border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h2 className="mb-4 text-3xl font-semibold text-slate-950">Trust, legal, and compliance resources</h2>
          <p className="mb-8 max-w-3xl text-lg text-slate-600">Review how Oxiom approaches security, privacy, data processing, and regulatory alignment before procurement or legal review.</p>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{trust.map(([title, href]) => (
            <Link key={href} href={href} className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50"><h3 className="text-lg font-semibold text-slate-950">{title}</h3></Link>
          ))}</div>
        </div>
      </div>
      <div className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8 lg:px-10">
          <h2 className="mb-4 text-3xl font-semibold text-slate-950">Need to open a support ticket?</h2>
          <p className="mb-8 text-lg text-slate-600">Use the contact page to route product issues, onboarding requests, enterprise escalations, or procurement follow-up to the right team.</p>
          <Link href="/contact" className="rounded-full bg-blue-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-700">Go to contact and ticket options</Link>
        </div>
      </div>
    </div>
  );
}
