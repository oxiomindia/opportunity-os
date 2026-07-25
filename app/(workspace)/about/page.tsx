import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Oxiom | Enterprise Invoice Processing',
  description: 'Learn about Oxiom, our mission to automate Accounts Payable, and our commitment to helping finance teams work smarter.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            About Oxiom
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Automating Accounts Payable to help finance teams focus on strategic work.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-slate-950">Our Mission</h2>
            <p className="mb-4 text-lg text-slate-600">
              Finance teams waste hours on manual invoice processing. We built Oxiom to automate this work so your team can focus on strategic financial operations.
            </p>
            <p className="text-lg text-slate-600">
              Oxiom Invoice Processing makes vendor invoice management faster, more accurate, and audit-ready—so your team can process more invoices with fewer people.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-slate-950">Our Vision</h2>
            <p className="mb-4 text-lg text-slate-600">
              Oxiom One is an integrated business platform designed to unify your entire organization.
            </p>
            <p className="text-lg text-slate-600">
              We start with Invoice Processing—the foundation of every business. Future modules will add CRM, Projects, HR, Inventory, and Analytics, all working together on one platform.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h2 className="mb-12 text-3xl font-semibold text-slate-950">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-3 text-xl font-semibold text-slate-950">Customer First</h3>
              <p className="text-slate-600">
                We listen to our customers and build features they actually need. Your success is our success.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-xl font-semibold text-slate-950">Security & Trust</h3>
              <p className="text-slate-600">
                Your financial data is sensitive. We protect it with enterprise-grade security and maintain the highest compliance standards.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-xl font-semibold text-slate-950">Continuous Improvement</h3>
              <p className="text-slate-600">
                We never stop innovating. Regular updates, new features, and improvements keep Oxiom ahead of your needs.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-xl font-semibold text-slate-950">Transparency</h3>
              <p className="text-slate-600">
                We're honest about what works, what doesn't, and what's coming next. No surprises, no vaporware promises.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-xl font-semibold text-slate-950">Simplicity</h3>
              <p className="text-slate-600">
                Complex problems deserve elegant solutions. Oxiom is powerful but easy to use.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-xl font-semibold text-slate-950">Enterprise Grade</h3>
              <p className="text-slate-600">
                Built for scale, security, and reliability. Oxiom powers mission-critical financial operations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24 lg:px-10">
        <h2 className="mb-12 text-3xl font-semibold text-slate-950">Product Roadmap</h2>
        <div className="space-y-8">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <h3 className="mb-2 text-xl font-semibold text-slate-950">✓ Oxiom Invoice Processing (Available)</h3>
            <p className="text-slate-600">Vendor invoice capture, organization, search, workflow, and exception management.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 opacity-75">
            <h3 className="mb-2 text-xl font-semibold text-slate-950">Coming Soon: AI & Automation</h3>
            <p className="text-slate-600">Intelligent data extraction, validation, duplicate detection, and automated approval workflows.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 opacity-75">
            <h3 className="mb-2 text-xl font-semibold text-slate-950">Coming Soon: ERP Integration</h3>
            <p className="text-slate-600">Seamless integration with SAP, NetSuite, Dynamics 365, and other major ERP platforms.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 opacity-75">
            <h3 className="mb-2 text-xl font-semibold text-slate-950">2027: Oxiom CRM, Projects, HR, Inventory, Analytics</h3>
            <p className="text-slate-600">Additional modules for a complete integrated business platform.</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-semibold text-slate-950">Get in Touch</h2>
          <p className="mb-8 text-lg text-slate-600">
            Have questions about Oxiom? We'd love to hear from you.
          </p>
          <a
            href="mailto:hello@oxiom.ai"
            className="inline-flex rounded-full bg-blue-600 px-8 py-3.5 font-semibold text-white hover:bg-blue-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
