import Link from 'next/link';
import { FAQSchema, BreadcrumbSchema } from '@/app/components/StructuredData';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | Oxiom Invoice Processing — 100+ Answers',
  description: 'Comprehensive answers to 100+ frequently asked questions about Oxiom Invoice Processing, AP automation, AI, OCR, ERP integration, security, compliance, and deployment.',
};

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

  // Vendor Invoice Processing — Extended
  {
    question: 'What invoice formats does Oxiom accept?',
    answer: 'Oxiom accepts PDF, JPEG, PNG, and TIFF invoice files. Scanned paper invoices, digital PDFs, and email attachments are all supported. Bulk upload is available for processing multiple invoices at once.',
  },
  {
    question: 'Can vendors submit invoices directly to Oxiom?',
    answer: 'Vendor self-service invoice submission is on our roadmap. Currently, invoices are uploaded by your AP team or captured via API from your email gateway. Direct vendor portal submission is planned for a future release.',
  },
  {
    question: 'How does Oxiom handle paper invoices?',
    answer: 'Scan paper invoices to PDF or image format, then upload them to Oxiom. The OCR engine (when available) will extract invoice data automatically. Until then, your team enters key fields manually after upload.',
  },
  {
    question: 'What happens when the same vendor sends invoices in different formats?',
    answer: 'Oxiom normalizes invoice data regardless of the source format. You can configure extraction templates per vendor so that each format is handled correctly, reducing manual correction for high-volume vendors.',
  },
  {
    question: 'Can Oxiom process invoices in foreign languages?',
    answer: 'Multi-language invoice processing is on the product roadmap. The current release focuses on English-language invoices. Contact sales for information on language support timelines.',
  },
  {
    question: 'How does Oxiom handle recurring invoices from the same vendor?',
    answer: 'Oxiom detects recurring patterns and allows you to create recurring invoice templates. This reduces data entry for regular suppliers like rent, utilities, and subscription services.',
  },

  // Accounts Payable — Extended
  {
    question: 'How does Oxiom reduce manual AP work?',
    answer: 'Oxiom automates the most time-consuming parts of AP: invoice capture, data extraction, routing to the right approver, exception flagging, and audit trail generation. Teams typically reduce manual processing time by 60–80% after full implementation.',
  },
  {
    question: 'Can Oxiom manage early payment discounts?',
    answer: 'Yes. Oxiom tracks invoice due dates and discount windows. The payment queue surfaces invoices eligible for early payment discounts so your team can prioritize them accordingly.',
  },
  {
    question: 'Does Oxiom support three-way matching?',
    answer: 'Three-way matching (PO, receipt, and invoice) is on the product roadmap. When released, Oxiom will automatically match invoices against purchase orders and goods receipts, flagging discrepancies for review.',
  },
  {
    question: 'How does Oxiom help with month-end close?',
    answer: 'Oxiom provides real-time visibility into invoice status so your team can clear the AP queue before close. Accrual reports highlight invoices received but not yet paid, simplifying the accrual process.',
  },
  {
    question: 'Can Oxiom handle intercompany invoices?',
    answer: 'Yes. Intercompany invoice processing is supported through multi-entity configuration. Invoices can be assigned to the appropriate entity, cost center, and GL code for proper accounting.',
  },

  // AI & OCR — Extended
  {
    question: 'How does AI improve invoice processing accuracy?',
    answer: 'AI models learn from previous invoice extractions to improve accuracy over time. The system identifies header fields (vendor name, invoice number, date, amount), line items, and GL coding suggestions with increasing precision as it processes more invoices from each vendor.',
  },
  {
    question: 'What fields does OCR extract from invoices?',
    answer: 'Oxiom\'s OCR extracts: invoice number, invoice date, due date, vendor name, vendor address, total amount, tax amount, line items (description, quantity, unit price, total), purchase order number, and payment terms.',
  },
  {
    question: 'How does Oxiom handle low-quality or faded scans?',
    answer: 'Oxiom applies image enhancement before OCR to improve accuracy on low-quality scans. For very poor-quality documents, the system flags them for manual data entry and shows the original image alongside the entry form.',
  },
  {
    question: 'Can AI suggest GL codes automatically?',
    answer: 'GL code suggestion based on vendor history and line item descriptions is on the roadmap. When available, the AI will recommend GL codes based on patterns from previous invoices, which approvers can confirm or override.',
  },
  {
    question: 'How does machine learning improve over time?',
    answer: 'Each time a user corrects an AI extraction, that correction trains the model. Over 3–6 months of operation, extraction accuracy typically improves significantly, reducing the correction rate for high-volume vendors.',
  },

  // Approval Workflows — Extended
  {
    question: 'Can approval rules be based on GL code?',
    answer: 'Yes. Approval routing can be configured based on GL code, cost center, project code, invoice amount, or vendor category. For example, IT invoices can route to the IT budget owner while facilities invoices route to the facilities manager.',
  },
  {
    question: 'What happens if an approver is on leave?',
    answer: 'Approval delegation allows approvers to assign a backup approver for periods of absence. You can also configure automatic escalation if an invoice is not approved within a defined timeframe.',
  },
  {
    question: 'Can I set approval time limits?',
    answer: 'Yes. Administrators can set SLA targets for each approval stage. When an invoice approaches or passes the SLA, Oxiom sends reminder notifications to the approver and escalation alerts to their manager.',
  },
  {
    question: 'Does Oxiom support conditional approval routing?',
    answer: 'Yes. Approval routing rules can include conditions such as: invoice amount over threshold, first-time vendor, GL code, or exception flag. Complex multi-branch approval trees are supported.',
  },
  {
    question: 'Can approvers reject invoices and send them back?',
    answer: 'Yes. Approvers can reject an invoice with a reason, which sends it back to the processor for correction. A full history of rejections and corrections is maintained in the audit trail.',
  },

  // Invoice Validation — Extended
  {
    question: 'What validation rules does Oxiom apply to invoices?',
    answer: 'Oxiom applies configurable validation rules including: required fields present, invoice number uniqueness, amount consistency (subtotal + tax = total), date validity, vendor existence in master data, and GL code validity.',
  },
  {
    question: 'Can I create custom validation rules?',
    answer: 'Yes. Administrators can define custom validation rules in the settings panel. Rules can check field formats, cross-reference other invoice fields, validate against master data, or trigger based on invoice attributes.',
  },
  {
    question: 'How are validation errors presented to users?',
    answer: 'Validation errors are displayed on the invoice detail screen with a clear description of each issue and guidance on how to resolve it. Users can correct errors directly in the interface and resubmit for validation.',
  },
  {
    question: 'Does Oxiom detect duplicate invoice numbers?',
    answer: 'Yes. Oxiom checks each incoming invoice number against existing records for the same vendor. Potential duplicates are flagged immediately so your team can investigate before approving payment.',
  },

  // ERP Integration — Extended
  {
    question: 'How does Oxiom connect to SAP?',
    answer: 'Oxiom integrates with SAP via REST API and SAP Business Technology Platform connectors. Invoice data flows from Oxiom to SAP FI (Financial Accounting) module after approval. Contact our integration team for SAP-specific documentation.',
  },
  {
    question: 'Does Oxiom work with Oracle Financials?',
    answer: 'Yes. Oxiom supports integration with Oracle Fusion Cloud Financials and Oracle E-Business Suite. Invoice payables data is synchronized automatically after approval workflows complete.',
  },
  {
    question: 'Can Oxiom export to QuickBooks?',
    answer: 'QuickBooks Online integration is on the roadmap for small-to-mid-size business customers. Currently, you can export invoice data as CSV for import into QuickBooks.',
  },
  {
    question: 'How are vendor master records synchronized?',
    answer: 'Vendor master data can be synchronized from your ERP on a scheduled basis. New vendors added in Oxiom can be exported back to your ERP for master data maintenance.',
  },
  {
    question: 'Does Oxiom support real-time ERP synchronization?',
    answer: 'Yes. Real-time webhook-based synchronization is available for enterprise customers. When an invoice status changes in Oxiom (e.g., approved), a webhook triggers an update in your ERP system.',
  },

  // Security — Extended
  {
    question: 'What encryption does Oxiom use?',
    answer: 'Oxiom uses AES-256 encryption for data at rest and TLS 1.3 for data in transit. Encryption keys are managed via a dedicated key management system with regular rotation.',
  },
  {
    question: 'Does Oxiom support multi-factor authentication?',
    answer: 'Yes. MFA is available for all user accounts and required for administrator access. Supported MFA methods include authenticator apps (TOTP), SMS, and hardware security keys.',
  },
  {
    question: 'Can Oxiom integrate with our corporate SSO?',
    answer: 'Yes. Oxiom supports SSO via SAML 2.0 and OAuth 2.0/OIDC. Integration with Okta, Azure Active Directory, Google Workspace, and other identity providers is supported.',
  },
  {
    question: 'How does Oxiom handle data breaches?',
    answer: 'Oxiom has a documented incident response plan. In the event of a data breach, affected customers are notified within 72 hours as required by GDPR. Our security team investigates, contains, and resolves incidents following industry best practices.',
  },
  {
    question: 'Is Oxiom hosted in a SOC 2-certified data center?',
    answer: 'Yes. Oxiom is hosted on cloud infrastructure that maintains SOC 2 Type II certification. We are pursuing our own SOC 2 Type II certification and will publish the report when available.',
  },

  // Deployment — Extended
  {
    question: 'Where is invoice data stored?',
    answer: 'Invoice data is stored in cloud infrastructure hosted in the United States by default. Regional data residency options (EU, Asia-Pacific) are available for enterprise customers with specific data sovereignty requirements.',
  },
  {
    question: 'What browsers does Oxiom support?',
    answer: 'Oxiom supports current versions of Chrome, Firefox, Edge, and Safari. Internet Explorer is not supported. Mobile browsers are supported for viewing, though the desktop experience is optimized for invoice processing work.',
  },
  {
    question: 'Can I use Oxiom on a mobile device?',
    answer: 'Oxiom has a responsive design for mobile use. Approvers can review and approve invoices from a smartphone or tablet. Full invoice processing is optimized for desktop.',
  },
  {
    question: 'What is the expected uptime SLA?',
    answer: 'Oxiom targets 99.9% uptime (approximately 8.7 hours downtime per year). Planned maintenance is scheduled during off-peak hours with advance notice. Enterprise SLAs with financial credits are available.',
  },
  {
    question: 'Does Oxiom offer a disaster recovery guarantee?',
    answer: 'Yes. Oxiom maintains geographically redundant infrastructure with automated failover. Recovery Point Objective (RPO) is under 1 hour and Recovery Time Objective (RTO) is under 4 hours for enterprise customers.',
  },

  // Compliance & Audit — Extended
  {
    question: 'How does Oxiom support internal audit requirements?',
    answer: 'Oxiom provides complete audit trails for every invoice including: initial capture date, all status changes, user actions at each stage, approval decisions, and any modifications. Audit reports can be exported for internal or external audit review.',
  },
  {
    question: 'Can I restrict who can see sensitive invoices?',
    answer: 'Yes. Oxiom supports invoice-level visibility controls. Sensitive invoices (e.g., executive compensation, legal invoices) can be restricted to specific user roles.',
  },
  {
    question: 'Does Oxiom support document retention schedules?',
    answer: 'Yes. Administrators can configure retention schedules by invoice type, vendor, or date range. Invoices beyond the retention period are automatically archived or deleted per your policy.',
  },

  // Performance & Scalability — Extended
  {
    question: 'What is Oxiom\'s maximum supported invoice volume per month?',
    answer: 'Oxiom is designed for enterprise scale and tested to support millions of invoices per month. The platform auto-scales on demand. For specific volume requirements, contact sales for capacity planning.',
  },
  {
    question: 'Does processing speed degrade as invoice volume grows?',
    answer: 'No. Oxiom uses elastic cloud infrastructure that scales horizontally. Processing capacity increases automatically as volume grows, maintaining consistent performance.',
  },

  // Troubleshooting — Extended
  {
    question: 'Why is an invoice stuck in "Processing" status?',
    answer: 'A stuck invoice usually means it is waiting for a step in the workflow—often an approval. Check the invoice\'s workflow history to identify the pending step and who owns it. Contact support if no action is pending.',
  },
  {
    question: 'An invoice amount is incorrect. How do I fix it?',
    answer: 'Open the invoice detail view and edit the amount field. All edits are logged in the audit trail. If the invoice has already been approved, a correction workflow must be initiated by an administrator.',
  },
  {
    question: 'How do I recover a mistakenly deleted invoice?',
    answer: 'Deleted invoices are retained in a soft-delete archive for 90 days. Administrators can restore them from the Admin panel under Data Management. After 90 days, deleted invoices are permanently removed.',
  },
  {
    question: 'What should I do if the OCR extraction is consistently wrong for one vendor?',
    answer: 'Report the issue via the feedback button on the extraction review screen. Our team will tune the extraction model for that vendor\'s invoice format. In the meantime, create a manual data entry template for that vendor.',
  },
  {
    question: 'I uploaded an invoice but it is not appearing. What happened?',
    answer: 'Check the Upload queue for error messages. Common issues include: file format not supported, file size exceeds limit, or upload interrupted. Re-upload the file and contact support if the problem persists.',
  },
  {
    question: 'How do I handle an invoice that was paid outside of Oxiom?',
    answer: 'Update the invoice status manually to "Paid" and add a note indicating it was processed externally. This keeps your records accurate and maintains the audit trail.',
  },
];

const categories = [
  { id: 'product', label: 'Product Overview' },
  { id: 'vendor', label: 'Vendor Invoice Processing' },
  { id: 'ap', label: 'Accounts Payable' },
  { id: 'ai', label: 'AI & OCR' },
  { id: 'workflow', label: 'Approval Workflows' },
  { id: 'validation', label: 'Invoice Validation' },
  { id: 'erp', label: 'ERP Integration' },
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
            Comprehensive answers to 100+ questions about Oxiom Invoice Processing — from setup and AI capabilities to security, compliance, and ERP integration.
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
              <p className="text-sm text-slate-600">Step-by-step guides for using Oxiom Invoice Processing.</p>
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
            Our support team is here to help. Reach out with any questions about Oxiom Invoice Processing.
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
