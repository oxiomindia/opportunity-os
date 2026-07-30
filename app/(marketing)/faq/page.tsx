import Link from 'next/link';
import { FAQSchema, BreadcrumbSchema } from '@/app/components/StructuredData';
import { Metadata } from 'next';
import { buildMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  path: '/faq',
  title: 'FAQ | Oxiom Billing — 100+ Answers',
  description: 'Comprehensive answers to 100+ frequently asked questions about Oxiom Billing: customer invoicing, the product/service catalog, PDF generation, security, compliance, and deployment.',
});

const faqs = [
  // Product Overview
  {
    question: 'What is Oxiom Invoice Software?',
    answer: 'Oxiom Invoice Software is a customer invoicing and accounts receivable solution. It helps finance teams create invoices, send them to customers, and track payment status from draft through paid, with intelligent organization, status tracking, and audit-ready billing—all on the Oxiom One platform.',
  },
  {
    question: 'Is Oxiom Invoice Software an invoice generator?',
    answer: 'Yes. Oxiom Invoice Software is designed to create and send invoices to your customers. Build invoices from your customer and product/service catalog, review them, send them, and track payment through to collection.',
  },
  {
    question: 'What is Oxiom One?',
    answer: 'Oxiom One is an enterprise business platform designed to unify business operations. Oxiom Invoice Software is the first production application. Future modules will include CRM, Projects, HR, Inventory, and Analytics—all integrated on a single platform.',
  },
  {
    question: 'How does Oxiom Invoice Software differ from accounting software?',
    answer: 'Oxiom Invoice Software is specialized for customer invoicing and accounts receivable. It is not accounting software. It focuses on creating, sending, and tracking customer invoices through to payment, but does not handle general ledger, financial statements, or other accounting functions.',
  },

  // Capabilities & Features
  {
    question: 'What can I do with Oxiom Invoice Software today?',
    answer: 'You can manage a customer directory and product/service catalog, create invoices from line items, organize them in a centralized repository, search across invoices and customers, track invoice status through the complete lifecycle (draft → sent → viewed → partially paid → paid → overdue → void), download a PDF of any invoice, and maintain an audit trail.',
  },
  {
    question: 'What features are coming soon?',
    answer: 'Planned features include recurring invoices, automated payment reminders, online payment collection, and integration with accounting platforms like QuickBooks and Xero.',
  },
  {
    question: 'Does Oxiom support multiple currencies?',
    answer: 'Yes. Oxiom supports invoices in INR, USD, and EUR with proper currency formatting. Amounts are never combined across currencies in reports.',
  },
  {
    question: 'Can I search for invoices?',
    answer: 'Yes. Oxiom includes global search functionality. You can search by invoice number, customer name, amount, status, date, and other fields. Results are ranked by relevance.',
  },
  {
    question: 'Can I generate a PDF of an invoice?',
    answer: 'Yes. Every invoice has a Download PDF action on its detail page, which opens a formatted, print-ready PDF in your browser’s native viewer — you can save it or print it directly from there.',
  },

  // Invoice Workflow
  {
    question: 'What is the invoice lifecycle in Oxiom?',
    answer: 'Invoices move through these statuses: Draft (being prepared, fully editable), Sent (delivered to the customer), Viewed, Partially Paid, Paid, Overdue, and Void. Only draft invoices can have line items added, be edited, or be deleted.',
  },
  {
    question: 'Can I track an invoice through its entire lifecycle?',
    answer: 'Yes. Oxiom maintains visibility into invoice status at every stage, including when it was created, when it was sent, and when payments were recorded against it.',
  },
  {
    question: 'Do invoices require approval before they can be sent?',
    answer: 'No. Any team member with invoice access can create a draft and send it to a customer. There is no multi-step approval workflow in the current release.',
  },

  // Billing Automation Roadmap
  {
    question: 'Does Oxiom automate any part of invoicing today?',
    answer: 'Today, invoice creation, line items, status tracking, and PDF generation are automated for you. Recurring invoices and automated payment reminders are planned for a future release.',
  },
  {
    question: 'Will Oxiom send payment reminders automatically?',
    answer: 'Automated payment reminders for overdue invoices are on the roadmap. Currently, you can see which invoices are overdue on your dashboard and follow up with customers directly.',
  },
  {
    question: 'Can customers pay their invoice online through Oxiom?',
    answer: 'Online payment collection is planned for a future release. Currently, payments are recorded manually once received through your existing payment channels.',
  },
  {
    question: 'Will Oxiom support recurring invoices?',
    answer: 'Recurring invoice templates for regular customers (e.g., monthly retainers or subscriptions) are on the roadmap for a future release.',
  },

  // Integration & Compatibility
  {
    question: 'Can Oxiom integrate with my accounting software?',
    answer: 'Accounting integration is on our product roadmap. We’re planning support for QuickBooks and Xero. Contact sales for the latest integration timeline.',
  },
  {
    question: 'Can I export invoice data from Oxiom?',
    answer: 'Yes. Invoice and customer data can be exported for use in other systems. Export capabilities include CSV and other common data formats.',
  },
  {
    question: 'Is there an API for custom integrations?',
    answer: 'Yes. Oxiom provides REST APIs for custom integrations. See the API documentation for details on authenticated endpoints.',
  },

  // Data & Security
  {
    question: 'How is my invoice data protected?',
    answer: 'Oxiom uses industry-standard encryption for data in transit and at rest. Each organization’s data is isolated with row-level security so one customer’s records are never visible to another.',
  },
  {
    question: 'Is Oxiom SOC 2 compliant?',
    answer: 'We are committed to security and compliance. Please contact our sales team for details on current compliance certifications and our security roadmap.',
  },
  {
    question: 'Can I use Oxiom on-premise?',
    answer: 'Oxiom is currently a cloud-only solution. On-premise deployment is not planned for the near term. We focus on cloud delivery to ensure security, scalability, and continuous updates.',
  },
  {
    question: 'How long is invoice data retained?',
    answer: 'Invoice data is retained according to your subscription and data retention policies. You can configure retention settings in the Admin section of Oxiom.',
  },
  {
    question: 'Can I delete invoice records?',
    answer: 'Yes. Draft invoices can be deleted directly. Sent, paid, or voided invoices are retained for audit purposes rather than deleted, consistent with standard invoicing practice.',
  },

  // Compliance & Audit
  {
    question: 'Does Oxiom maintain an audit trail?',
    answer: 'Yes. Oxiom maintains a trail of invoice activity including when invoices were created, status changes (sent, viewed, paid, overdue, void), and when payments were recorded.',
  },
  {
    question: 'Is Oxiom GDPR compliant?',
    answer: 'Oxiom is designed with GDPR compliance in mind. We handle customer personal data according to GDPR principles and provide data processing agreements. Please contact us for detailed compliance documentation.',
  },
  {
    question: 'Does Oxiom support compliance requirements like SOX?',
    answer: 'Oxiom is designed to support financial compliance requirements including SOX. Status-guarded invoice actions, audit trails, and user access controls help meet compliance and internal-control requirements.',
  },
  {
    question: 'Can I generate compliance reports?',
    answer: 'Yes. Oxiom provides reporting on invoice status distribution, payment rates, and billed totals that can support compliance documentation and internal reporting.',
  },

  // Performance & Scalability
  {
    question: 'How many invoices can Oxiom handle?',
    answer: 'Oxiom is designed for enterprise scale. The platform can handle hundreds of thousands of invoices. Performance scales automatically with your business volume.',
  },
  {
    question: 'What happens during peak usage?',
    answer: 'Oxiom automatically scales to handle usage peaks. Infrastructure automatically adjusts to maintain performance during high-volume periods.',
  },
  {
    question: 'What is the system uptime?',
    answer: 'Oxiom is built on enterprise cloud infrastructure designed for high availability. We monitor uptime closely and provide service level agreements for enterprise customers.',
  },

  // Deployment & Implementation
  {
    question: 'How long does it take to implement Oxiom?',
    answer: 'Basic implementation typically takes days, not weeks: create your organization, add your customers and product/service catalog, and start invoicing. Our team is available to help with larger imports and customization needs.',
  },
  {
    question: 'What is required to get started?',
    answer: 'You need: 1) an organization account, 2) a list of your customers, 3) your product/service catalog with pricing. We provide a straightforward onboarding flow to set these up.',
  },
  {
    question: 'Do you provide training?',
    answer: 'Yes. Oxiom includes documentation and support to help your team get started, including admin setup, day-to-day invoicing workflows, and ongoing support.',
  },
  {
    question: 'How do I migrate existing invoice or customer data?',
    answer: 'We provide guidance and support for importing historical customer and invoice data from your current system. Our team helps map your data and ensure accurate migration.',
  },

  // Pricing & Licensing
  {
    question: 'How is Oxiom priced?',
    answer: 'Oxiom pricing is based on monthly invoice volume, number of users, and additional features. We offer flexible pricing plans for organizations of all sizes. Contact our sales team for a custom quote.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes. We offer a free trial so you can explore Oxiom with your team. Contact sales to request a trial account.',
  },
  {
    question: 'What is included in each pricing tier?',
    answer: 'Our pricing tiers typically include different volumes of invoices, number of users, storage capacity, and API calls. Please contact sales for detailed pricing information.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes. You can adjust your plan at any time. Changes take effect in your next billing cycle.',
  },
  {
    question: 'Is there a contract term requirement?',
    answer: 'We offer flexible options including monthly plans, annual plans with discounts, and custom enterprise agreements. Discuss your needs with our sales team.',
  },

  // Support & Troubleshooting
  {
    question: 'What support is available?',
    answer: 'Oxiom provides email support, knowledge base articles, and documentation. Enterprise customers have access to priority support and dedicated account management.',
  },
  {
    question: 'What should I do if an invoice goes missing?',
    answer: 'Check the search function to locate the invoice. If it cannot be found, review the activity log. Contact support if the invoice is truly missing—we can help investigate.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page. You will receive an email with instructions to reset your password. If you do not receive the email, check your spam folder or contact support.',
  },
  {
    question: 'I cannot log in. What should I do?',
    answer: 'Verify your email address and password are correct. Try resetting your password. Clear your browser cache and cookies. If problems persist, contact support with your email address.',
  },

  // Administration
  {
    question: 'How do I add users to my organization?',
    answer: 'Self-service team invitations are on the roadmap and not available yet. Contact support if you need to add teammates to your organization in the meantime.',
  },
  {
    question: 'What user roles are available?',
    answer: 'Oxiom stores an Owner, Admin, Reviewer, Member, or Viewer role for each organization member. Role-based permission enforcement across the app is still being built out.',
  },
  {
    question: 'Can I manage user access at any time?',
    answer: 'Self-service role and access management from Settings is on the roadmap and not available yet. Contact support for changes to your organization\'s membership.',
  },

  // Reporting & Analytics
  {
    question: 'What reports are available?',
    answer: 'Oxiom’s dashboard and reports cover invoice volume, status distribution (draft, sent, overdue, paid, and more), paid rate, overdue rate, and total billed, broken out by currency.',
  },
  {
    question: 'Can I export report data?',
    answer: 'Yes. Underlying invoice data can be exported in CSV format for use in your own analysis and business intelligence tools.',
  },

  // Best Practices
  {
    question: 'What is the best way to organize customers in Oxiom?',
    answer: 'Standardize customer names to avoid duplicates. Use consistent naming conventions (e.g., "Company Name Inc." not "Company Name" or "Company Inc."). This improves search accuracy and reporting.',
  },
  {
    question: 'Should I use the product/service catalog for every invoice?',
    answer: 'Where possible, yes — pulling line items from your catalog keeps pricing and descriptions consistent. Custom one-off line items are also supported for invoices that need them.',
  },
  {
    question: 'How often should I review my dashboard?',
    answer: 'Review your dashboard regularly to catch overdue invoices early. Many customers check weekly at minimum, and more often during month-end billing pushes.',
  },
  {
    question: 'What is a good invoice turnaround time target?',
    answer: 'Many organizations aim to send an invoice within 1-2 business days of completing work or delivering a product, which shortens the time to payment.',
  },

  // Advanced Topics
  {
    question: 'Can I use Oxiom with multiple legal entities?',
    answer: 'Multi-entity support (separate billing identities under one account) is on our roadmap. Contact sales to discuss your specific requirements.',
  },
  {
    question: 'Does Oxiom support multi-currency invoicing?',
    answer: 'Yes. Oxiom handles invoices in INR, USD, and EUR. Each invoice is created and reported in a single currency, so amounts are never combined across currencies.',
  },
  {
    question: 'Is there an API for custom workflows?',
    answer: 'Yes. Oxiom provides REST APIs. API documentation is available for developers building custom integrations.',
  },

  // Invoice Creation — Extended
  {
    question: 'How do I create an invoice?',
    answer: 'Go to Invoices → New Invoice, pick a customer, and add line items — either from your product/service catalog or as custom entries with a description, quantity, and unit price. The invoice starts as a draft that you can edit freely.',
  },
  {
    question: 'Can I edit an invoice after I create it?',
    answer: 'Yes, while it’s a draft. Once you send it to the customer, editing is locked to protect the record — you can still record payments, mark it void, or (for unsent drafts) delete it.',
  },
  {
    question: 'Can I add products or services to an invoice line item?',
    answer: 'Yes. When adding a line item you can select an entry from your product/service catalog, which fills in the description and unit price automatically, or enter a custom line item.',
  },
  {
    question: 'What invoice number format does Oxiom use?',
    answer: 'Draft invoices show a temporary reference until sent. Sent invoices receive a sequential invoice number that’s unique within your organization.',
  },
  {
    question: 'Can I void an invoice?',
    answer: 'Yes. Any invoice that isn’t already paid or void can be voided. Voided invoices remain in your records for audit purposes but no longer count toward outstanding balances.',
  },
  {
    question: 'How do I record a payment against an invoice?',
    answer: 'Open the invoice and use Record Payment to log the amount received. Invoices update to Partially Paid or Paid automatically depending on how much of the total has been collected.',
  },

  // Collections & Payment Tracking — Extended
  {
    question: 'How does Oxiom track overdue invoices?',
    answer: 'Invoices past their due date without full payment are tracked as overdue on your dashboard and in reports, so you can see exactly what’s outstanding at a glance.',
  },
  {
    question: 'Can Oxiom handle partial payments?',
    answer: 'Yes. Recording a payment that doesn’t cover the full invoice total moves the invoice to Partially Paid, and you can continue recording payments until it’s fully paid.',
  },
  {
    question: 'How does Oxiom help with month-end close?',
    answer: 'Your dashboard and reports give real-time visibility into outstanding, overdue, and paid invoices, so you can review your accounts receivable position before close.',
  },
  {
    question: 'Can I see which customers have outstanding balances?',
    answer: 'Yes. The invoice list and dashboard let you filter and view invoices by status, including all outstanding (sent, viewed, partially paid, overdue) balances per customer.',
  },
  {
    question: 'Does Oxiom support late fees or early payment discounts?',
    answer: 'Not in the current release. Late fees and early-payment discount handling are being considered for a future release.',
  },

  // Invoice Validation — Extended
  {
    question: 'What validation rules does Oxiom apply to invoices?',
    answer: 'Oxiom validates that line item quantities and unit prices are non-negative, that a customer is selected, and that status-guarded actions (like sending or deleting) are only available when the invoice is in the right state — for example, only drafts can be edited or deleted.',
  },
  {
    question: 'How are validation errors presented to users?',
    answer: 'Validation errors are shown inline on the invoice form with a clear description of the issue, so you can correct it and resubmit immediately.',
  },
  {
    question: 'Does Oxiom prevent invalid status transitions?',
    answer: 'Yes. Every status-changing action is guarded server-side — for example, you can’t send an invoice that’s already been sent, or delete one that isn’t a draft.',
  },

  // Accounting Integration — Extended
  {
    question: 'Will Oxiom sync invoices to my accounting software?',
    answer: 'Two-way sync with accounting platforms like QuickBooks and Xero is on our roadmap. Until then, invoice data can be exported as CSV for manual import.',
  },
  {
    question: 'Can I export invoices for my accountant?',
    answer: 'Yes. You can export invoice data as CSV, and generate a PDF of any individual invoice to share directly.',
  },
  {
    question: 'Does Oxiom replace my general ledger?',
    answer: 'No. Oxiom is focused on customer invoicing and accounts receivable, not general ledger or full accounting. It’s designed to complement accounting software, not replace it.',
  },

  // Security — Extended
  {
    question: 'What encryption does Oxiom use?',
    answer: 'Oxiom uses industry-standard encryption for data at rest and in transit between your browser and our servers.',
  },
  {
    question: 'Does Oxiom support multi-factor authentication?',
    answer: 'MFA support is on our security roadmap. Contact sales for the current timeline if this is a requirement for your organization.',
  },
  {
    question: 'Can Oxiom integrate with our corporate SSO?',
    answer: 'SSO integration (SAML/OIDC) is on our roadmap for enterprise customers. Contact sales to discuss your identity provider and timeline.',
  },
  {
    question: 'How does Oxiom isolate data between organizations?',
    answer: 'Every tenant-scoped table uses row-level security policies keyed to organization membership, so one organization’s customers, products, and invoices are never visible to another.',
  },
  {
    question: 'How does Oxiom handle a security incident?',
    answer: 'Oxiom follows a documented incident response process. Affected customers are notified promptly in the event of a confirmed data incident, consistent with our data processing obligations.',
  },

  // Deployment — Extended
  {
    question: 'Where is invoice data stored?',
    answer: 'Invoice data is stored in cloud infrastructure with organization-level data isolation. Regional data residency options may be available for enterprise customers with specific requirements — contact sales to discuss.',
  },
  {
    question: 'What browsers does Oxiom support?',
    answer: 'Oxiom supports current versions of Chrome, Firefox, Edge, and Safari. Internet Explorer is not supported.',
  },
  {
    question: 'Can I use Oxiom on a mobile device?',
    answer: 'Oxiom has a responsive design, so you can review invoices and check your dashboard from a phone or tablet. The full invoicing workflow is optimized for desktop.',
  },
  {
    question: 'What is the expected uptime SLA?',
    answer: 'Oxiom targets high availability with cloud infrastructure. Enterprise SLAs with specific uptime commitments are available — contact sales for details.',
  },

  // Compliance & Audit — Extended
  {
    question: 'How does Oxiom support internal audit requirements?',
    answer: 'Oxiom tracks each invoice’s creation date, every status change, and payment records, giving auditors a clear trail from draft to paid (or void).',
  },
  {
    question: 'Can I restrict who can see sensitive invoices?',
    answer: 'Today, all invoices are visible to every member of your organization. Role-based and per-invoice visibility controls are on the roadmap and not available yet.',
  },
  {
    question: 'Does Oxiom support document retention schedules?',
    answer: 'Retention is currently governed by your subscription and organization settings. Configurable per-record retention schedules are being considered for a future release.',
  },

  // Performance & Scalability — Extended
  {
    question: 'What is Oxiom’s maximum supported invoice volume per month?',
    answer: 'Oxiom is designed for enterprise scale and tested to support high invoice volumes with auto-scaling infrastructure. For specific volume requirements, contact sales for capacity planning.',
  },
  {
    question: 'Does processing speed degrade as invoice volume grows?',
    answer: 'No. Oxiom uses cloud infrastructure that scales horizontally, maintaining consistent performance as your invoice volume grows.',
  },

  // Troubleshooting — Extended
  {
    question: 'Why can’t I edit an invoice?',
    answer: 'Only draft invoices can be edited. Once an invoice has been sent, its line items are locked — you can still record payments or void it, but editing the content is intentionally restricted to protect the record you sent to the customer.',
  },
  {
    question: 'An invoice line item amount is incorrect. How do I fix it?',
    answer: 'If the invoice is still a draft, edit or remove the line item and re-add it with the correct amount. If it has already been sent, void it and create a corrected invoice, since sent invoices are not editable.',
  },
  {
    question: 'How do I handle an invoice that was paid outside of Oxiom?',
    answer: 'Use Record Payment on the invoice to log the amount received, even if the payment itself was collected outside Oxiom (e.g., bank transfer). This keeps your status and reports accurate.',
  },
  {
    question: 'Why does an invoice show as Overdue?',
    answer: 'An invoice moves to Overdue when it has passed its due date without being fully paid. Recording a payment that covers the full amount moves it to Paid.',
  },
];

const categories = [
  { id: 'product', label: 'Product Overview' },
  { id: 'invoicing', label: 'Invoice Creation' },
  { id: 'collections', label: 'Collections & Payments' },
  { id: 'validation', label: 'Invoice Validation' },
  { id: 'accounting', label: 'Accounting Integration' },
  { id: 'security', label: 'Security' },
  { id: 'compliance', label: 'Compliance & Audit' },
  { id: 'pricing', label: 'Pricing & Licensing' },
  { id: 'deployment', label: 'Deployment' },
  { id: 'performance', label: 'Performance' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://oxiom.in' },
        { name: 'FAQ', url: 'https://oxiom.in/faq' },
      ]} />

      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <nav className="mb-4 text-sm text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-700">Home</Link>
            <span className="mx-2">›</span>
            <span>FAQ</span>
          </nav>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Comprehensive answers to 100+ questions about Oxiom Billing — from customer invoicing and payment tracking to security, compliance, and deployment.
          </p>
          <p className="mt-3 text-sm text-slate-500">{faqs.length} questions answered</p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b border-slate-100 bg-white py-4">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600"
              >
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details key={index} className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-950 hover:text-blue-700">
                <span className="text-left">{faq.question}</span>
                <span className="ml-2 shrink-0 text-slate-600 transition group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-slate-600 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h2 className="mb-8 text-2xl font-semibold text-slate-950">Additional Resources</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/docs"
              className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="mb-2 font-semibold text-slate-950">Documentation</h3>
              <p className="text-sm text-slate-600">Step-by-step guides for using Oxiom Billing.</p>
            </Link>
            <Link
              href="/support"
              className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="mb-2 font-semibold text-slate-950">Support</h3>
              <p className="text-sm text-slate-600">Contact our support team for personalized help.</p>
            </Link>
            <Link
              href="/docs/getting-started"
              className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="mb-2 font-semibold text-slate-950">Getting Started</h3>
              <p className="text-sm text-slate-600">New to Oxiom? Start with our quick-start guide.</p>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-slate-100 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-semibold text-slate-950">
            Still have questions?
          </h2>
          <p className="mb-8 text-lg text-slate-600">
            Our support team is here to help. Reach out with any questions about Oxiom Billing.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex rounded-full bg-blue-600 px-8 py-3.5 font-semibold text-white hover:bg-blue-700"
            >
              Contact Support
            </Link>
            <Link
              href="/docs"
              className="inline-flex rounded-full border border-slate-200 px-8 py-3.5 font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700"
            >
              Browse Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
