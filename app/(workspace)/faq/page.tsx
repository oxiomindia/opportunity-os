import { FAQSchema } from '@/app/components/StructuredData';

const faqs = [
  // Product Overview
  {
    question: 'What is Oxiom Invoice Processing?',
    answer: 'Oxiom Invoice Processing is an AI-powered vendor invoice processing and Accounts Payable automation solution. It helps finance teams manage incoming supplier invoices from capture through payment, with intelligent organization, status tracking, exception management, and audit-ready processing—all on the Oxiom One platform.',
  },
  {
    question: 'Is Oxiom Invoice Processing an invoice generator?',
    answer: 'No. Oxiom Invoice Processing is designed to automate the processing of incoming vendor invoices, not to create customer invoices. It is not a billing, invoicing, or quotation tool. It focuses entirely on managing supplier invoices received by your organization.',
  },
  {
    question: 'What is Oxiom One?',
    answer: 'Oxiom One is an enterprise business platform designed to unify business operations. Oxiom Invoice Processing is the first production application. Future modules will include CRM, Projects, HR, Inventory, and Analytics—all integrated on a single platform.',
  },
  {
    question: 'How does Oxiom Invoice Processing differ from accounting software?',
    answer: 'Oxiom Invoice Processing is specialized for vendor invoice processing and Accounts Payable automation. It is not accounting software. It focuses on capturing, organizing, validating, and routing supplier invoices, but does not handle general ledger, financial reporting, or other accounting functions.',
  },

  // Capabilities & Features
  {
    question: 'What can I do with Oxiom Invoice Processing today?',
    answer: 'You can capture vendor invoices, organize them in a centralized repository, search across invoices and vendors, track invoice status through the complete lifecycle (received → processing → verified → approved → payment-ready → paid), identify exceptions, and maintain an audit trail.',
  },
  {
    question: 'What features are coming soon?',
    answer: 'Planned features include AI-powered data extraction, intelligent validation against POs and GL codes, duplicate detection, customizable approval workflows, ERP system integration, advanced analytics dashboards, and automated exception routing.',
  },
  {
    question: 'Does Oxiom support multiple currencies?',
    answer: 'Yes. Oxiom Invoice Processing supports invoices in INR, USD, and EUR with proper currency formatting and conversion tracking.',
  },
  {
    question: 'Can I search for invoices?',
    answer: 'Yes. Oxiom includes intelligent global search functionality. You can search by invoice number, vendor name, amount, status, date, and other fields. Results are ranked by relevance.',
  },
  {
    question: 'How does exception management work?',
    answer: 'Oxiom identifies invoices with data issues or exceptions and flags them for manual review. You can view exception details, understand the issue, and take corrective action before approving payment.',
  },

  // Invoice Workflow
  {
    question: 'What is the invoice lifecycle in Oxiom?',
    answer: 'Invoices flow through these statuses: 1) Received - invoice captured, 2) Processing - initial intake, 3) Needs Review - requires attention, 4) Verified - data validated, 5) Accounts Review - accounting verification, 6) Approved - ready for payment, 7) Payment-Ready - queued for processing, 8) Paid - payment completed.',
  },
  {
    question: 'Can I track an invoice through the entire workflow?',
    answer: 'Yes. Oxiom maintains complete visibility into invoice status at every stage. You can view the current status, history of status changes, who reviewed it, when it moved between stages, and any exceptions encountered.',
  },
  {
    question: 'How do approval workflows work?',
    answer: 'Approval workflow automation is planned for a future release. Currently, you can manually manage invoice approvals. Once released, workflows will support customizable routing based on invoice amount, vendor category, GL code, and other criteria.',
  },

  // AI & Automation
  {
    question: 'Does Oxiom use AI for invoice processing?',
    answer: 'AI-powered invoice processing is planned for future releases. When available, it will automatically extract data from invoices using OCR and machine learning, validate extracted information, detect duplicate submissions, and intelligently route invoices for approval.',
  },
  {
    question: 'What is OCR and how will it be used?',
    answer: 'OCR (Optical Character Recognition) technology reads text from invoice images and documents. When available in Oxiom, it will extract invoice details like invoice number, date, amount, GL codes, and line items, reducing manual data entry and improving accuracy.',
  },
  {
    question: 'How accurate is the planned AI data extraction?',
    answer: 'We are still developing and testing the AI data extraction feature. When released, we will publish confidence scores and accuracy metrics. For now, Oxiom focuses on organizing and routing invoices for manual review.',
  },
  {
    question: 'Will Oxiom detect duplicate invoices?',
    answer: 'Duplicate detection is planned for a future release. When available, Oxiom will automatically identify and flag duplicate invoice submissions to prevent duplicate payments.',
  },

  // Integration & Compatibility
  {
    question: 'Can Oxiom integrate with my ERP system?',
    answer: 'ERP integration is on our product roadmap and coming soon. Currently, you use Oxiom to manage vendor invoices and visibility. We are actively developing integrations with major ERP platforms.',
  },
  {
    question: 'Which ERP systems will be supported?',
    answer: 'We are planning integrations with major ERP platforms including SAP, Oracle NetSuite, Microsoft Dynamics 365, and others. Please contact sales for the latest integration roadmap.',
  },
  {
    question: 'Can I export invoice data from Oxiom?',
    answer: 'Yes. You can export invoice data in standard formats for use in other systems. Export capabilities include CSV and other common data formats.',
  },
  {
    question: 'Does Oxiom integrate with email or vendor portals?',
    answer: 'Email and vendor portal integration is planned for future releases. Currently, invoices can be uploaded manually or imported through API.',
  },

  // Data & Security
  {
    question: 'How is my invoice data protected?',
    answer: 'Oxiom uses industry-standard encryption for data in transit and at rest. All data is stored securely on cloud infrastructure with regular security audits and compliance monitoring.',
  },
  {
    question: 'Is Oxiom SOC 2 compliant?',
    answer: 'We are committed to security and compliance. Please contact our sales team for details on current compliance certifications and our security roadmap.',
  },
  {
    question: 'Can I use Oxiom on-premise?',
    answer: 'Oxiom Invoice Processing is currently a cloud-only solution. On-premise deployment is not planned for the near term. We focus on cloud delivery to ensure security, scalability, and continuous updates.',
  },
  {
    question: 'How long is invoice data retained?',
    answer: 'Invoice data is retained according to your subscription and data retention policies. You can configure retention settings in the Admin section of Oxiom.',
  },
  {
    question: 'Can I delete invoice records?',
    answer: 'Yes. Administrators can delete individual invoices or batches of invoices. Deleted records are retained in audit logs for compliance purposes but are no longer accessible in the primary system.',
  },

  // Compliance & Audit
  {
    question: 'Does Oxiom maintain an audit trail?',
    answer: 'Yes. Oxiom maintains a complete audit trail of all invoice activity including: when invoices were created, status changes, who reviewed each invoice, modifications made, and when payments were processed.',
  },
  {
    question: 'Is Oxiom GDPR compliant?',
    answer: 'Oxiom is designed with GDPR compliance in mind. We handle vendor personal data according to GDPR principles and provide data processing agreements. Please contact us for detailed compliance documentation.',
  },
  {
    question: 'Does Oxiom support compliance requirements like SOX?',
    answer: 'Oxiom is designed to support financial compliance requirements including SOX. Complete audit trails, user access controls, and exception management help meet compliance and internal control requirements.',
  },
  {
    question: 'Can I generate compliance reports?',
    answer: 'Yes. Oxiom provides reporting capabilities for compliance documentation including invoice processing timelines, exception reports, approval chains, and audit trails.',
  },

  // Performance & Scalability
  {
    question: 'How many invoices can Oxiom handle?',
    answer: 'Oxiom is designed for enterprise scale. The platform can handle hundreds of thousands of invoices. Performance scales automatically with your business volume.',
  },
  {
    question: 'How fast does invoice processing work?',
    answer: 'Invoice ingestion is nearly instantaneous. Processing time depends on your workflow and approval steps. Current manual workflows complete at the speed your team reviews and approves invoices.',
  },
  {
    question: 'What happens during peak processing times?',
    answer: 'Oxiom automatically scales to handle processing peaks. Infrastructure automatically adjusts to maintain performance during high-volume periods.',
  },
  {
    question: 'What is the system uptime?',
    answer: 'Oxiom is built on enterprise cloud infrastructure designed for high availability. We monitor uptime closely and provide service level agreements for enterprise customers.',
  },

  // Deployment & Implementation
  {
    question: 'How long does it take to implement Oxiom?',
    answer: 'Basic implementation typically takes 2-4 weeks depending on your team size, invoice volume, and customization needs. Our implementation team guides you through setup, configuration, and team training.',
  },
  {
    question: 'What is required to get started?',
    answer: 'You need: 1) Finance team access, 2) Invoice samples, 3) List of vendors, 4) Approval authority, 5) List of GL codes used in your organization. We provide a detailed onboarding checklist.',
  },
  {
    question: 'Do you provide training?',
    answer: 'Yes. Oxiom includes comprehensive training for your team including admin training, end-user training, and ongoing support. We provide documentation, video tutorials, and live training sessions.',
  },
  {
    question: 'Can I customize Oxiom to match my workflow?',
    answer: 'Yes. Oxiom supports significant customization including custom fields, workflow stages, approval rules, and reporting. Our team works with you during implementation to configure the system for your specific needs.',
  },
  {
    question: 'How do I migrate existing invoice data?',
    answer: 'We provide data migration tools and support. You can import historical invoice data from your current system. Our team helps map your data and ensure accurate migration.',
  },

  // Pricing & Licensing
  {
    question: 'How is Oxiom priced?',
    answer: 'Oxiom Invoice Processing pricing is based on monthly invoice volume, number of users, and additional features. We offer flexible pricing plans for organizations of all sizes. Contact our sales team for a custom quote.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes. We offer a free trial so you can explore Oxiom Invoice Processing with your team. Contact sales to request a trial account.',
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
    answer: 'Oxiom provides email support, knowledge base articles, video tutorials, and community forums. Enterprise customers have access to priority support and dedicated account management.',
  },
  {
    question: 'What should I do if an invoice goes missing?',
    answer: 'Check the search function to locate the invoice. If it cannot be found, review the invoice history and audit logs. Contact support if the invoice is truly missing—we can help investigate.',
  },
  {
    question: 'Why is an invoice showing an exception?',
    answer: 'Exceptions indicate data quality issues such as missing required fields, formatting problems, or validation failures. Click on the exception to see details and take corrective action.',
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
    question: 'How do I add users to Oxiom?',
    answer: 'In Admin Settings, go to Users and click "Add User." Enter the user email, select their role, and save. The user will receive an invitation email with setup instructions.',
  },
  {
    question: 'What user roles are available?',
    answer: 'Oxiom supports multiple roles including Admin (full access), Approver (review and approve invoices), Processor (capture and organize invoices), Viewer (read-only access), and custom roles.',
  },
  {
    question: 'How do I manage user permissions?',
    answer: 'Permissions are managed through user roles and access controls. Assign appropriate roles to each user during setup. Administrators can modify permissions at any time.',
  },
  {
    question: 'Can I set spending limits or approval authorities?',
    answer: 'Yes. Administrators can configure approval authorities, spending limits, and approval rules. For example, you can route invoices over $10,000 to Finance Manager approval.',
  },

  // Reporting & Analytics
  {
    question: 'What reports are available?',
    answer: 'Oxiom provides reports on invoice volume, processing time, exception rates, vendor analysis, payment timing, and compliance metrics. Advanced analytics are coming soon.',
  },
  {
    question: 'Can I schedule reports?',
    answer: 'Yes. You can configure recurring reports to be emailed to your team on a schedule (daily, weekly, monthly). Report scheduling is available in Admin Settings.',
  },
  {
    question: 'Can I export report data?',
    answer: 'Yes. Reports can be exported in CSV, Excel, or PDF formats. You can use this data in your own analysis and business intelligence tools.',
  },

  // Best Practices
  {
    question: 'What is the best way to organize vendors in Oxiom?',
    answer: 'Standardize vendor names to avoid duplicates. Use consistent naming conventions (e.g., "Company Name Inc." not "Company Name" or "Company Inc."). This improves search accuracy and reporting.',
  },
  {
    question: 'How should I structure approval workflows?',
    answer: 'Start with simple workflows and iterate. Common structures include: 1) Single approval for invoices under $5,000, 2) Two approvals over $5,000, 3) Special approval for certain vendors or GL codes.',
  },
  {
    question: 'How often should I review reports?',
    answer: 'Review processing metrics weekly to identify bottlenecks. Review exception reports daily to address data quality issues quickly. Run comprehensive analytics monthly for trend analysis.',
  },
  {
    question: 'What is a good invoice processing time target?',
    answer: 'Most organizations target 3-5 business days from receipt to payment. With Oxiom, many customers achieve 2-3 days by streamlining workflows and reducing manual steps.',
  },

  // Advanced Topics
  {
    question: 'Can I use Oxiom with multiple legal entities?',
    answer: 'Yes. Oxiom supports multi-entity configurations. You can organize invoices by entity, company code, cost center, or other hierarchy. Contact sales for enterprise multi-entity setup.',
  },
  {
    question: 'Does Oxiom support multi-currency processing?',
    answer: 'Yes. Oxiom handles invoices in multiple currencies (INR, USD, EUR). Exchange rates can be configured and updated regularly.',
  },
  {
    question: 'Can I set up custom fields?',
    answer: 'Yes. Administrators can add custom fields to capture organization-specific data like Cost Center, Department, Project ID, or other metadata.',
  },
  {
    question: 'Is there an API for custom integrations?',
    answer: 'Yes. Oxiom provides REST APIs for custom integrations. API documentation and sandbox environment are available for developers.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <FAQSchema faqs={faqs} />

      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Get answers to common questions about Oxiom Invoice Processing, implementation, features, and support.
          </p>
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

      {/* CTA Section */}
      <div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-semibold text-slate-950">
            Still have questions?
          </h2>
          <p className="mb-8 text-lg text-slate-600">
            Our support team is here to help. Reach out with any questions about Oxiom Invoice Processing.
          </p>
          <a
            href="mailto:hello@oxiom.ai"
            className="inline-flex rounded-full bg-blue-600 px-8 py-3.5 font-semibold text-white hover:bg-blue-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
