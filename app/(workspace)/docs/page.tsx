import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation | Oxiom Invoice Processing',
  description: 'Complete documentation for Oxiom Invoice Processing including user guides, administrator guides, and implementation documentation.',
};

const docSections = [
  {
    title: 'Getting Started',
    description: 'New to Oxiom? Start here to learn the basics.',
    items: [
      { title: 'Introduction', href: '/docs/getting-started/introduction' },
      { title: 'Quick Start Guide', href: '/docs/getting-started/quick-start' },
      { title: 'First Invoice', href: '/docs/getting-started/first-invoice' },
      { title: 'Dashboard Overview', href: '/docs/getting-started/dashboard' },
    ],
  },
  {
    title: 'User Guide',
    description: 'Learn how to use Oxiom Invoice Processing.',
    items: [
      { title: 'Invoice Search', href: '/docs/user-guide/search' },
      { title: 'Invoice Workflow', href: '/docs/user-guide/workflow' },
      { title: 'Exception Management', href: '/docs/user-guide/exceptions' },
      { title: 'Reports', href: '/docs/user-guide/reports' },
      { title: 'Best Practices', href: '/docs/user-guide/best-practices' },
    ],
  },
  {
    title: 'Administrator Guide',
    description: 'Configure and manage Oxiom for your organization.',
    items: [
      { title: 'User Management', href: '/docs/admin/users' },
      { title: 'Roles & Permissions', href: '/docs/admin/permissions' },
      { title: 'Workflow Configuration', href: '/docs/admin/workflows' },
      { title: 'Custom Fields', href: '/docs/admin/custom-fields' },
      { title: 'Integration Setup', href: '/docs/admin/integrations' },
      { title: 'Data Management', href: '/docs/admin/data-management' },
    ],
  },
  {
    title: 'Implementation',
    description: 'Deploy and configure Oxiom for your organization.',
    items: [
      { title: 'Implementation Guide', href: '/docs/implementation/guide' },
      { title: 'Data Migration', href: '/docs/implementation/migration' },
      { title: 'Integration Planning', href: '/docs/implementation/integration' },
      { title: 'User Training', href: '/docs/implementation/training' },
      { title: 'Go-Live Checklist', href: '/docs/implementation/checklist' },
    ],
  },
  {
    title: 'Troubleshooting',
    description: 'Resolve common issues and get help.',
    items: [
      { title: 'Common Issues', href: '/docs/troubleshooting/common-issues' },
      { title: 'Error Messages', href: '/docs/troubleshooting/errors' },
      { title: 'FAQ', href: '/faq' },
      { title: 'Contact Support', href: 'mailto:hello@oxiom.ai' },
    ],
  },
];

export default function DocumentationIndex() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Documentation
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Comprehensive guides and resources for Oxiom Invoice Processing.
          </p>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="space-y-16">
          {docSections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-2 text-2xl font-semibold text-slate-950">{section.title}</h2>
              <p className="mb-6 text-slate-600">{section.description}</p>
              <div className="grid gap-4 md:grid-cols-2">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <h3 className="font-semibold text-slate-950 hover:text-blue-700">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Quick Resources */}
      <div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h2 className="mb-8 text-2xl font-semibold text-slate-950">Quick Resources</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <a
              href="/faq"
              className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="mb-2 font-semibold text-slate-950">FAQ</h3>
              <p className="text-sm text-slate-600">Answers to frequently asked questions about Oxiom Invoice Processing.</p>
            </a>
            <a
              href="/public/security.md"
              className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="mb-2 font-semibold text-slate-950">Security</h3>
              <p className="text-sm text-slate-600">Learn about Oxiom&apos;s security measures and compliance standards.</p>
            </a>
            <a
              href="mailto:hello@oxiom.ai"
              className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="mb-2 font-semibold text-slate-950">Support</h3>
              <p className="text-sm text-slate-600">Contact our support team for help with your questions.</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
