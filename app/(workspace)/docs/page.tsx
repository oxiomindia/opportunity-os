import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation | Oxiom Invoice Processing',
  description: 'Complete documentation for Oxiom Invoice Processing including user guides, administrator guides, implementation documentation, and API references.',
};

const sections = [
  {
    title: 'Getting Started',
    description: 'New to Oxiom? Begin with onboarding, first-run guidance, and support resources.',
    items: [
      { label: 'Getting Started Guide', href: '/docs/getting-started' },
      { label: 'Support Hub', href: '/support' },
      { label: 'Troubleshooting Guide', href: '/docs/troubleshooting' },
    ],
  },
  {
    title: 'User Guides',
    description: 'Learn how AP and finance teams use Oxiom Invoice Processing day to day.',
    items: [
      { label: 'User Guide', href: '/docs/user-guide' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Release Notes', href: '/release-notes' },
    ],
  },
  {
    title: 'Administration & Implementation',
    description: 'Configure roles, workflows, integrations, and rollout plans for your organization.',
    items: [
      { label: 'Administrator Guide', href: '/docs/admin' },
      { label: 'Implementation Guide', href: '/docs/implementation' },
      { label: 'Compliance Overview', href: '/compliance' },
    ],
  },
  {
    title: 'Developers & Integrations',
    description: 'Review API usage, ERP alignment, and trust documentation before integration work begins.',
    items: [
      { label: 'API Documentation', href: '/docs/api' },
      { label: 'Security Overview', href: '/security' },
      { label: 'Data Processing Policy', href: '/legal/data-processing' },
    ],
  },
];

const quick = [
  {
    title: 'Support',
    href: '/support',
    description: 'Route product issues, onboarding questions, and enterprise escalation needs.',
  },
  {
    title: 'Changelog',
    href: '/changelog',
    description: 'Browse version history, feature additions, and product improvements.',
  },
  {
    title: 'Solutions',
    href: '/solutions',
    description: 'Explore AP automation, AI capture, workflow, and ERP integration solution pages.',
  },
];

export default function DocumentationIndex() {
  return <div className="min-h-screen bg-white"><div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"><h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Documentation</h1><p className="max-w-2xl text-lg text-slate-600">Comprehensive guides and operational resources for Oxiom Invoice Processing.</p></div></div><div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10"><div className="space-y-16">{sections.map((section) => (<section key={section.title}><h2 className="mb-2 text-2xl font-semibold text-slate-950">{section.title}</h2><p className="mb-6 text-slate-600">{section.description}</p><div className="grid gap-4 md:grid-cols-3">{section.items.map((item) => (<Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"><h3 className="font-semibold text-slate-950 hover:text-blue-700">{item.label}</h3></Link>))}</div></section>))}</div></div><div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10"><h2 className="mb-8 text-2xl font-semibold text-slate-950">Quick Resources</h2><div className="grid gap-6 md:grid-cols-3">{quick.map((resource) => (<Link key={resource.href} href={resource.href} className="rounded-lg border border-slate-200 bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50"><h3 className="mb-2 font-semibold text-slate-950">{resource.title}</h3><p className="text-sm text-slate-600">{resource.description}</p></Link>))}</div></div></div></div>;
}
