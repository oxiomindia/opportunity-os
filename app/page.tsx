'use client';

import Link from 'next/link';
import { OrganizationSchema, SoftwareApplicationSchema, WebSiteSchema, FAQSchema } from './StructuredData';

const footerLinks = [
  { label: 'Email', value: 'hello@oxiom.ai', href: 'mailto:hello@oxiom.ai' },
  { label: 'Phone', value: '+1 (555) 014-9028', href: 'tel:+15550149028' },
  { label: 'LinkedIn', value: 'LinkedIn', href: 'https://www.linkedin.com/company/oxiom' },
  { label: 'X (Twitter)', value: '@oxiom', href: 'https://x.com/oxiom' },
];

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8 sm:px-8 lg:px-10">
      <a href="#top" className="text-xl font-semibold tracking-tight text-slate-950" aria-label="Oxiom home">
        Oxiom
      </a>
      <nav className="flex items-center gap-3" aria-label="Primary navigation">
        <a
          href="/dashboard"
          aria-label="Explore Invoice Processing platform"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-base font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700"
        >
          →
        </a>
        <a
          href="mailto:hello@oxiom.ai"
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Request Demo
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-20 sm:px-8 sm:py-32 lg:px-10">
      <div className="text-center">
        <p className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Accounts Payable Automation
        </p>
        <h1 className="mb-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Automate Vendor Invoice Processing with Intelligence
        </h1>
        <p className="mx-auto mb-12 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
          Oxiom Invoice Processing helps finance teams manage incoming supplier invoices from capture and review through validation, approval, exception handling, and audit-ready processing—all within the Oxiom One platform.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="mailto:hello@oxiom.ai?subject=Oxiom%20Invoice%20Processing%20Demo%20Request"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-700"
          >
            Request a Demo
          </a>
          <a
            href="/dashboard"
            aria-label="Explore the platform"
            className="inline-flex items-center justify-center rounded-full border-2 border-slate-200 px-8 py-3.5 text-base font-semibold text-slate-950 hover:border-blue-200 hover:text-blue-700"
          >
            Explore Invoice Processing
          </a>
        </div>
      </div>
    </section>
  );
}

function ProblemStatement() {
  const challenges = [
    { title: 'Manual Processing', desc: 'Finance teams spend hours on manual data entry and invoice routing.' },
    { title: 'Email Approvals', desc: 'Bottlenecks with email-based approval workflows slow payments.' },
    { title: 'Data Errors', desc: 'Manual processes introduce duplicate invoices and data entry mistakes.' },
    { title: 'Compliance Risk', desc: 'Limited audit trail and visibility creates compliance exposure.' },
    { title: 'Late Payments', desc: 'Processing delays cause missed payment terms and supplier issues.' },
    { title: 'Lack of Visibility', desc: 'No real-time insight into AP status or invoice exceptions.' },
  ];

  return (
    <section className="border-t border-slate-100 bg-slate-50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Finance Teams Face Complex Challenges
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Manual vendor invoice processing creates bottlenecks, errors, and compliance risks that delay payments and frustrate suppliers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <div key={challenge.title} className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-2 font-semibold text-slate-950">{challenge.title}</h3>
              <p className="text-sm text-slate-600">{challenge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const capabilitiesImplemented = [
    { title: 'Invoice Capture & Search', desc: 'Find invoices quickly across your vendor base with intelligent global search.' },
    { title: 'Data Organization', desc: 'Centralized invoice repository with vendor, amount, and status information.' },
    { title: 'Status Tracking', desc: 'Track invoices through processing lifecycle: received → processing → verified → approved → paid.' },
    { title: 'Exception Management', desc: 'Identify and manage invoices with exceptions for manual review.' },
    { title: 'Multi-Currency Support', desc: 'Process invoices in INR, USD, EUR with proper formatting.' },
    { title: 'Audit Trail', desc: 'Complete visibility into invoice history and processing steps.' },
  ];

  const capabilitiesPlanned = [
    { title: 'AI Data Extraction', desc: 'Automated OCR and AI to extract invoice data with high confidence.' },
    { title: 'Intelligent Validation', desc: 'Automatic validation against GL codes, POs, and business rules.' },
    { title: 'Duplicate Detection', desc: 'Prevent duplicate invoice processing with intelligent matching.' },
    { title: 'Approval Workflows', desc: 'Customizable approval routing based on invoice amounts and types.' },
    { title: 'ERP Integration', desc: 'Seamless integration with major ERP systems for invoice posting.' },
    { title: 'Analytics Dashboard', desc: 'Real-time visibility into AP metrics, cycle times, and KPIs.' },
  ];

  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Invoice Processing Capabilities
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Manage your vendor invoices from intake through payment with intelligent automation and visibility.
          </p>
        </div>

        {/* Currently Available */}
        <div className="mb-16">
          <h3 className="mb-6 text-xl font-semibold text-slate-950">✓ Available Now</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilitiesImplemented.map((cap) => (
              <div key={cap.title} className="rounded-lg border border-green-200 bg-green-50 p-5">
                <h4 className="mb-2 font-semibold text-slate-950">{cap.title}</h4>
                <p className="text-sm text-slate-700">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Planned Features */}
        <div>
          <h3 className="mb-6 text-xl font-semibold text-slate-950">Coming Soon</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilitiesPlanned.map((cap) => (
              <div key={cap.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5 opacity-75">
                <h4 className="mb-2 font-semibold text-slate-950">{cap.title}</h4>
                <p className="text-sm text-slate-600">{cap.desc}</p>
                <span className="mt-3 inline-block rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                  Planned
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InvoiceWorkflow() {
  const steps = [
    { number: '1', title: 'Receive', desc: 'Invoices captured from email, portals, and manual uploads.' },
    { number: '2', title: 'Review', desc: 'Centralized view of all incoming invoices with search and filtering.' },
    { number: '3', title: 'Validate', desc: 'Check for duplicates, exceptions, and data issues.' },
    { number: '4', title: 'Approve', desc: 'Route through approval workflows with exception management.' },
    { number: '5', title: 'Process', desc: 'Prepare for payment with audit trail and compliance documentation.' },
    { number: '6', title: 'Pay', desc: 'Process payments with full visibility and vendor communication.' },
  ];

  return (
    <section className="border-t border-slate-100 bg-slate-50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Complete Invoice Processing Lifecycle
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            From vendor invoice capture through payment, streamlined and automated.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                {step.number}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const benefits = [
    {
      title: 'Reduce Manual Work',
      items: ['Eliminate manual data entry and routing', 'Automated invoice organization and categorization'],
    },
    {
      title: 'Accelerate Approvals',
      items: ['Faster invoice processing and payment cycles', 'Reduce AP processing time by 50%+'],
    },
    {
      title: 'Improve Accuracy',
      items: ['Reduce duplicate invoices and data errors', 'Consistent, audit-ready invoice handling'],
    },
    {
      title: 'Strengthen Compliance',
      items: ['Complete audit trail for all invoices', 'Regulatory documentation and compliance ready'],
    },
    {
      title: 'Enhance Visibility',
      items: ['Real-time invoice status tracking', 'Exception alerts and bottleneck identification'],
    },
    {
      title: 'Scale Operations',
      items: ['Handle invoice volume growth without headcount', 'Vendor invoice management at enterprise scale'],
    },
  ];

  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Benefits for Finance Teams
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Streamline Accounts Payable operations and improve finance team efficiency.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-slate-950">{benefit.title}</h3>
              <ul className="space-y-2">
                {benefit.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OxiomOnePlatform() {
  const modules = [
    { name: 'Oxiom Invoice Processing', status: 'Available', desc: 'Vendor invoice processing and AP automation' },
    { name: 'Oxiom CRM', status: 'Coming Soon', desc: 'Customer relationship and sales management' },
    { name: 'Oxiom Projects', status: 'Coming Soon', desc: 'Project planning and resource management' },
    { name: 'Oxiom HR', status: 'Coming Soon', desc: 'Human resources and talent management' },
    { name: 'Oxiom Inventory', status: 'Coming Soon', desc: 'Inventory and supply chain management' },
    { name: 'Oxiom Analytics', status: 'Coming Soon', desc: 'Business intelligence and reporting' },
  ];

  return (
    <section className="border-t border-slate-100 bg-slate-50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Part of Oxiom One
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Oxiom Invoice Processing is the first module of Oxiom One, an enterprise business platform designed to unify your entire business.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.name}
              className={`rounded-lg border p-6 ${
                module.status === 'Available'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-white opacity-75'
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold text-slate-950">{module.name}</h3>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    module.status === 'Available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {module.status}
                </span>
              </div>
              <p className="text-sm text-slate-600">{module.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: 'What is Oxiom Invoice Processing?',
      a: 'Oxiom Invoice Processing is an AI-powered vendor invoice processing and Accounts Payable automation solution. It helps finance teams manage incoming supplier invoices from capture through payment, with intelligent organization, status tracking, exception management, and audit-ready processing—all on the Oxiom One platform.',
    },
    {
      q: 'Is this invoice generation software?',
      a: 'No. Oxiom Invoice Processing is designed to process and automate the handling of incoming vendor invoices and Accounts Payable workflows. It is not an invoice creation, billing, or quotation application. It does not generate customer invoices—it automates the processing of supplier invoices received by your organization.',
    },
    {
      q: 'What features are available today?',
      a: 'Today you can capture, organize, search, and track vendor invoices across statuses. View exceptions and manage the invoice lifecycle. AI extraction, intelligent validation, approval workflows, ERP integration, and advanced analytics are coming soon.',
    },
    {
      q: 'What is Oxiom One?',
      a: 'Oxiom One is an enterprise business platform. Oxiom Invoice Processing is the first application. Future modules include CRM, Projects, HR, Inventory, and Analytics—all unified on one platform to streamline your entire business.',
    },
    {
      q: 'Can I integrate with my ERP system?',
      a: 'ERP integration is on our roadmap and coming soon. For now, you can use Oxiom Invoice Processing to centrally manage vendor invoices with full visibility.',
    },
    {
      q: 'How does AI help with invoice processing?',
      a: 'AI-powered invoice processing is planned for future releases. When available, it will automatically extract data from vendor invoices, validate information, detect duplicates, and route invoices intelligently—reducing manual work.',
    },
  ];

  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-950">
                {faq.q}
                <span className="text-slate-600 transition group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700 py-20 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-8 lg:px-10">
        <h2 className="mb-6 text-3xl font-semibold text-white sm:text-4xl">
          Ready to Automate Your AP Process?
        </h2>
        <p className="mb-8 text-lg text-blue-100">
          Request a demo to see Oxiom Invoice Processing in action and learn how to streamline your vendor invoice workflow.
        </p>
        <a
          href="mailto:hello@oxiom.ai?subject=Oxiom%20Invoice%20Processing%20Demo%20Request"
          className="inline-flex rounded-full bg-white px-8 py-3.5 font-semibold text-blue-600 hover:bg-blue-50"
        >
          Request a Demo
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 font-semibold text-white">Oxiom</h3>
            <p className="text-sm">
              Enterprise business platform for automating vendor invoice processing and Accounts Payable workflows.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/dashboard" className="hover:text-white">
                  Invoice Processing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Connect</h4>
            <div className="flex flex-col gap-2 text-sm">
              {footerLinks.map((link) => (
                <a key={link.label} href={link.href} className="hover:text-white">
                  <span className="sr-only">{link.label}: </span>
                  {link.value}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Oxiom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <StructuredDataContainer />
      <Header />
      <main id="top">
        <Hero />
        <ProblemStatement />
        <Capabilities />
        <InvoiceWorkflow />
        <Benefits />
        <OxiomOnePlatform />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function StructuredDataContainer() {
  const faqs = [
    {
      question: 'What is Oxiom Invoice Processing?',
      answer: 'Oxiom Invoice Processing is an AI-powered vendor invoice processing and Accounts Payable automation solution. It helps finance teams manage incoming supplier invoices from capture through payment, with intelligent organization, status tracking, exception management, and audit-ready processing—all on the Oxiom One platform.',
    },
    {
      question: 'Is this invoice generation software?',
      answer: 'No. Oxiom Invoice Processing is designed to process and automate the handling of incoming vendor invoices and Accounts Payable workflows. It is not an invoice creation, billing, or quotation application. It does not generate customer invoices—it automates the processing of supplier invoices received by your organization.',
    },
    {
      question: 'What is Oxiom One?',
      answer: 'Oxiom One is an enterprise business platform. Oxiom Invoice Processing is the first application. Future modules include CRM, Projects, HR, Inventory, and Analytics—all unified on one platform to streamline your entire business.',
    },
  ];

  return (
    <>
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <WebSiteSchema />
      <FAQSchema faqs={faqs} />
    </>
  );
}
