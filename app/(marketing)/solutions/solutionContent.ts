import type { Metadata } from 'next';
import { buildMetadata } from '../../../lib/seo/metadata';

export type SolutionPageContent = {
  slug: string;
  pageName: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  valueProps: string[];
  focus: string[];
  useCases: string[];
  related: string[];
};

export const solutionPages: SolutionPageContent[] = [
  {
    "slug": "input-tax-credit-recovery",
    "pageName": "Input Tax Credit Recovery",
    "title": "Input Tax Credit Recovery & GST Reconciliation Software | Oxiom",
    "description": "Reconcile purchase-side GST with your filed returns. Oxiom's Input Tax Credit Recovery & Reconciliation matches purchase invoices against filed GST return records, flagging matched, missing, and mismatched credit.",
    "heading": "Input Tax Credit recovery and GST reconciliation for Indian finance teams",
    "intro": "Oxiom Input Tax Credit Recovery & Reconciliation matches your purchase invoices against filed GST return records — GSTIN and invoice number, with a configurable amount tolerance — so finance teams and CAs can see exactly which input tax credit is matched, missing, or mismatched, and recover credit they might otherwise miss.",
    "valueProps": [
      "Purchase-to-return matching",
      "GSTIN and invoice-number reconciliation",
      "Manual entry or CSV import",
      "CSV and PDF export for filing"
    ],
    "focus": [
      "GST reconciliation",
      "input tax credit recovery",
      "purchase register vs. filed return",
      "GSTIN-based matching"
    ],
    "useCases": [
      "Finance teams reconciling purchase invoices against GSTR filings every period.",
      "CAs identifying eligible input tax credit a client would otherwise miss.",
      "Businesses moving off manual spreadsheet-based GST reconciliation."
    ],
    "related": [
      "accounts-payable-automation",
      "ap-analytics",
      "erp-invoice-integration"
    ]
  },
  {
    "slug": "vendor-invoice-processing",
    "pageName": "Customer Invoicing",
    "title": "Customer Invoicing Software | Bill Customers Faster | Oxiom",
    "description": "Streamline customer invoicing with Oxiom. Create invoices from your product and service catalog, send them, and track payment status in one place.",
    "heading": "Customer invoicing software built for growing finance teams",
    "intro": "Oxiom gives finance leaders a single operating layer for creating invoices, sending them to customers, and tracking every dollar until it's collected.",
    "valueProps": [
      "Centralized billing",
      "Customer-ready invoices",
      "Operational visibility",
      "Faster collection cycles"
    ],
    "focus": [
      "customer records",
      "invoice creation",
      "duplicate prevention",
      "accounting handoff"
    ],
    "useCases": [
      "Shared services teams billing a high volume of customers.",
      "Companies coordinating invoices across multiple business units.",
      "Fast-growing companies replacing spreadsheet-based billing."
    ],
    "related": [
      "supplier-invoice-management",
      "invoice-approval-workflow",
      "invoice-processing-software"
    ]
  },
  {
    "slug": "invoice-processing-software",
    "pageName": "Invoice Processing Software",
    "title": "Invoice Processing Software | End-to-End AR Automation | Oxiom",
    "description": "Modern invoice processing software for end-to-end billing automation. Manage creation, sending, payment tracking, and collections in Oxiom.",
    "heading": "End-to-end invoice processing software for modern finance operations",
    "intro": "Oxiom Invoice Software helps finance teams manage the full lifecycle of a customer invoice in one platform with governance, visibility, and measurable collection performance.",
    "valueProps": [
      "One workflow backbone",
      "Finance-first controls",
      "Scalable operations",
      "Better decision support"
    ],
    "focus": [
      "lifecycle management",
      "payment tracking",
      "searchable worklists",
      "operational dashboards"
    ],
    "useCases": [
      "Mid-market finance teams leaving spreadsheet billing behind.",
      "Companies standardizing invoicing across entities.",
      "Finance leaders improving month-end receivables visibility."
    ],
    "related": [
      "accounts-payable-automation",
      "invoice-lifecycle-management",
      "ap-analytics"
    ]
  },
  {
    "slug": "ai-invoice-processing",
    "pageName": "AI Invoice Processing",
    "title": "AI-Powered Invoicing | Intelligent Billing Automation | Oxiom",
    "description": "Use AI-powered invoicing to accelerate billing operations. Oxiom supports smart line-item suggestions, payment-risk prioritization, and collections insight.",
    "heading": "AI-powered invoicing that improves speed and control",
    "intro": "Oxiom applies intelligent automation to repetitive billing work so teams can focus on customer relationships and financial oversight.",
    "valueProps": [
      "Smarter invoice drafting",
      "Better prioritization",
      "Learning workflows",
      "Human oversight"
    ],
    "focus": [
      "AI-assisted invoice creation",
      "payment-risk scoring",
      "collections prioritization",
      "review feedback loops"
    ],
    "useCases": [
      "Teams billing a mix of one-time and recurring customers.",
      "Organizations rolling out automation with reviewer oversight.",
      "Finance groups absorbing growth without matching headcount growth."
    ],
    "related": [
      "intelligent-document-processing",
      "ocr-invoice-processing",
      "invoice-validation"
    ]
  },
  {
    "slug": "intelligent-document-processing",
    "pageName": "Intelligent Invoicing & Documents",
    "title": "Intelligent Invoicing & Document Management | Oxiom",
    "description": "Oxiom delivers intelligent invoicing and document management for finance teams that need reliable invoice generation, supporting docs, and workflow automation.",
    "heading": "Intelligent invoicing for document-driven finance workflows",
    "intro": "Oxiom combines invoice generation, supporting documentation, and workflow orchestration so billing becomes structured finance work instead of scattered files.",
    "valueProps": [
      "Document understanding",
      "Workflow orchestration",
      "Quality control",
      "Enterprise scale"
    ],
    "focus": [
      "invoice templates",
      "normalized customer fields",
      "review queues",
      "searchable archives"
    ],
    "useCases": [
      "Global teams consolidating customer billing.",
      "IT leaders replacing scattered invoicing tools.",
      "Finance groups standardizing billing across entities."
    ],
    "related": [
      "document-processing-software",
      "invoice-capture",
      "ai-invoice-processing"
    ]
  },
  {
    "slug": "accounts-payable-automation",
    "pageName": "Accounts Receivable Automation",
    "title": "Accounts Receivable Automation Software | AR Automation | Oxiom",
    "description": "Automate accounts receivable workflows with Oxiom. Improve invoice throughput, strengthen controls, and reduce manual work across billing and collections.",
    "heading": "Accounts receivable automation software for controlled growth",
    "intro": "Oxiom helps finance organizations modernize AR without sacrificing policy compliance, visibility, or audit readiness.",
    "valueProps": [
      "Process standardization",
      "Faster billing cycles",
      "Audit discipline",
      "Cash flow visibility"
    ],
    "focus": [
      "automated invoice creation",
      "send and reminder workflows",
      "payment tracking",
      "accounting exports"
    ],
    "useCases": [
      "Teams scaling billing after growth or acquisitions.",
      "Organizations replacing manual invoicing.",
      "CFO teams tightening control over receivables."
    ],
    "related": [
      "ap-workflow-automation",
      "procure-to-pay",
      "financial-operations-automation",
      "input-tax-credit-recovery"
    ]
  },
  {
    "slug": "ap-workflow-automation",
    "pageName": "Billing Workflow Automation",
    "title": "Billing Workflow Automation | Streamline Invoice Processes | Oxiom",
    "description": "Streamline billing workflow automation with configurable creation, review, and sending steps for invoices, plus visibility into payment status.",
    "heading": "Billing workflow automation that keeps invoices moving",
    "intro": "Oxiom automates the handoffs that slow billing down, from draft to send to payment, with clear ownership and visibility at every step.",
    "valueProps": [
      "Configurable workflows",
      "Reminder automation",
      "Clear ownership",
      "Consistent controls"
    ],
    "focus": [
      "draft-to-send rules",
      "task assignment",
      "reminder triggers",
      "workflow analytics"
    ],
    "useCases": [
      "Distributed teams with layered review structures.",
      "Finance managers reducing time-to-send delays.",
      "Finance teams formalizing billing responsibilities."
    ],
    "related": [
      "invoice-approval-workflow",
      "accounts-payable-automation",
      "enterprise-workflow-automation"
    ]
  },
  {
    "slug": "supplier-invoice-management",
    "pageName": "Customer Account Management",
    "title": "Customer Account Management | Centralize Billing Records | Oxiom",
    "description": "Centralize customer account management with Oxiom. Gain visibility into invoices, payment history, and account standing across your billing operation.",
    "heading": "Customer account management with stronger visibility and control",
    "intro": "Oxiom gives finance teams a unified way to manage customer billing relationships from invoice creation through payment collection.",
    "valueProps": [
      "Customer-centric records",
      "Central billing visibility",
      "Collaboration support",
      "Operational resilience"
    ],
    "focus": [
      "customer invoice history",
      "account-level views",
      "payment status routing",
      "customer reporting"
    ],
    "useCases": [
      "Finance teams managing thousands of customer accounts.",
      "Sales and finance teams resolving billing questions together.",
      "Shared services groups improving customer billing experience."
    ],
    "related": [
      "vendor-invoice-processing",
      "invoice-capture",
      "ap-analytics"
    ]
  },
  {
    "slug": "invoice-approval-workflow",
    "pageName": "Invoice Approval Workflow",
    "title": "Invoice Approval Workflow Software | Review Before You Send | Oxiom",
    "description": "Manage invoice approval workflows with Oxiom. Support multi-level review before sending, delegation, and audit-ready decision histories.",
    "heading": "Invoice approval workflow software for confident sending",
    "intro": "Oxiom helps finance teams formalize invoice review before it reaches a customer, without slowing the business down.",
    "valueProps": [
      "Review policy alignment",
      "Flexible escalation",
      "Full traceability",
      "Faster sending"
    ],
    "focus": [
      "multi-level review",
      "delegated approvals",
      "decision history",
      "bottleneck visibility"
    ],
    "useCases": [
      "Finance teams enforcing sign-off before invoices go out.",
      "Teams reducing send delays from unclear ownership.",
      "Organizations with layered review hierarchies."
    ],
    "related": [
      "ap-workflow-automation",
      "invoice-validation",
      "procure-to-pay"
    ]
  },
  {
    "slug": "invoice-capture",
    "pageName": "Invoice Creation",
    "title": "Invoice Creation Software | From Catalog to Customer | Oxiom",
    "description": "Create invoices quickly with Oxiom. Pull from your product and service catalog, add line items, and prepare invoices for review and sending.",
    "heading": "Invoice creation that starts with your catalog, not a blank page",
    "intro": "Oxiom provides a controlled way to build invoices from your customers and product/service catalog so billing stays consistent and fast.",
    "valueProps": [
      "Catalog-driven creation",
      "Invoice readiness",
      "Operational consistency",
      "Immediate visibility"
    ],
    "focus": [
      "product/service line items",
      "customer selection",
      "line-item pricing",
      "draft management"
    ],
    "useCases": [
      "Teams replacing manual, document-based invoicing.",
      "Organizations consolidating billing into one system.",
      "Finance groups seeking better draft-to-send visibility."
    ],
    "related": [
      "ocr-invoice-processing",
      "intelligent-document-processing",
      "digital-invoice-processing"
    ]
  },
  {
    "slug": "ocr-invoice-processing",
    "pageName": "Recurring Invoice Automation",
    "title": "Recurring Invoice Automation | Bill on a Schedule | Oxiom",
    "description": "Automate recurring invoices with Oxiom. Generate and send invoices for subscriptions and repeat billing without manual re-entry each cycle.",
    "heading": "Recurring invoice automation for predictable billing",
    "intro": "Oxiom automates the invoices you send on a schedule, so subscription and repeat billing doesn't depend on someone remembering to create them.",
    "valueProps": [
      "Automated generation",
      "Review by exception",
      "Data consistency",
      "Faster processing"
    ],
    "focus": [
      "billing schedules",
      "template reuse",
      "confidence review",
      "searchable metadata"
    ],
    "useCases": [
      "Teams billing customers on subscription or retainer terms.",
      "Organizations moving from manual re-entry to structured recurring billing.",
      "Finance groups needing automation with oversight."
    ],
    "related": [
      "invoice-capture",
      "ai-invoice-processing",
      "document-processing-software"
    ]
  },
  {
    "slug": "invoice-validation",
    "pageName": "Invoice Validation",
    "title": "Invoice Validation Software | Automated Validation Rules | Oxiom",
    "description": "Automate invoice validation with business rules in Oxiom. Catch duplicates, missing fields, and pricing mismatches before an invoice reaches a customer.",
    "heading": "Invoice validation software that strengthens billing controls",
    "intro": "Oxiom helps finance teams validate invoices before they're sent, catching problems while they're still cheap to fix.",
    "valueProps": [
      "Control-first processing",
      "Duplicate defense",
      "Exception clarity",
      "Reliable readiness"
    ],
    "focus": [
      "required field checks",
      "duplicate detection",
      "pricing tolerance rules",
      "exception reporting"
    ],
    "useCases": [
      "Finance teams enforcing stricter controls before sending.",
      "Organizations reducing duplicate or incorrect invoices.",
      "Finance leaders standardizing policy checks after growth."
    ],
    "related": [
      "invoice-approval-workflow",
      "ai-invoice-processing",
      "accounts-payable-automation"
    ]
  },
  {
    "slug": "erp-invoice-integration",
    "pageName": "Accounting & ERP Integration",
    "title": "Accounting & ERP Integration | Sync Billing Data | Oxiom",
    "description": "Connect Oxiom with accounting and ERP systems for invoice and payment data. Support finance workflows across SAP, Oracle, NetSuite, and other platforms.",
    "heading": "Accounting and ERP integration that keeps billing data connected",
    "intro": "Oxiom fits into enterprise finance architecture by connecting billing operations to customer master data and downstream revenue recognition processes.",
    "valueProps": [
      "Connected data flow",
      "Less swivel-chair work",
      "Governed handoff",
      "Flexible architecture"
    ],
    "focus": [
      "customer master data alignment",
      "export mappings",
      "sync exceptions",
      "integration governance"
    ],
    "useCases": [
      "IT and finance teams deploying billing automation alongside ERP investments.",
      "Global organizations synchronizing multiple ERP instances.",
      "Teams reducing manual re-entry between systems."
    ],
    "related": [
      "finance-process-automation",
      "procure-to-pay",
      "invoice-processing-software"
    ]
  },
  {
    "slug": "finance-process-automation",
    "pageName": "Finance Process Automation",
    "title": "Finance Process Automation | Automate Financial Operations | Oxiom",
    "description": "Automate finance processes with Oxiom. Improve billing operations, approvals, controls, and reporting across shared services and finance teams.",
    "heading": "Finance process automation that starts with billing operations",
    "intro": "Oxiom helps finance organizations modernize operational processes that still rely on inboxes, spreadsheets, and manual follow-up.",
    "valueProps": [
      "Operational standardization",
      "Cross-team coordination",
      "Better visibility",
      "Platform readiness"
    ],
    "focus": [
      "workflow automation",
      "centralized queues",
      "validation controls",
      "integration support"
    ],
    "useCases": [
      "Finance transformation programs pursuing quick wins.",
      "Shared services organizations creating common ways of working.",
      "CFO organizations improving operational resilience."
    ],
    "related": [
      "business-process-automation",
      "financial-operations-automation",
      "enterprise-workflow-automation"
    ]
  },
  {
    "slug": "digital-invoice-processing",
    "pageName": "Digital Invoicing",
    "title": "Digital Invoicing | Paperless Billing Automation | Oxiom",
    "description": "Move to digital invoicing with Oxiom. Replace paper, email, and spreadsheet-driven billing with a controlled, paperless process for sending invoices.",
    "heading": "Digital invoicing for paperless billing operations",
    "intro": "Oxiom helps finance teams shift from paper-heavy and email-heavy invoicing to a digital process built for scale.",
    "valueProps": [
      "Paperless billing",
      "Accessible records",
      "Modern workflow control",
      "Audit-ready storage"
    ],
    "focus": [
      "digital invoice delivery",
      "status-linked records",
      "paperless approvals",
      "retention support"
    ],
    "useCases": [
      "Organizations retiring paper-based invoicing.",
      "Remote or hybrid finance teams needing digital access.",
      "Shared services groups centralizing billing records."
    ],
    "related": [
      "invoice-capture",
      "document-processing-software",
      "invoice-lifecycle-management"
    ]
  },
  {
    "slug": "enterprise-workflow-automation",
    "pageName": "Enterprise Workflow Automation",
    "title": "Enterprise Workflow Automation | Oxiom One Platform",
    "description": "Enterprise workflow automation for finance teams on the Oxiom One platform. Standardize billing, controls, and process visibility across operations.",
    "heading": "Enterprise workflow automation for controlled finance execution",
    "intro": "Oxiom One provides workflow automation patterns that help enterprise teams coordinate billing work reliably across business units and control functions.",
    "valueProps": [
      "Reusable workflow model",
      "Governed execution",
      "Enterprise visibility",
      "Scalable foundation"
    ],
    "focus": [
      "workflow configuration",
      "role-based queues",
      "status tracking",
      "security-aligned access"
    ],
    "useCases": [
      "Enterprises standardizing billing after organizational change.",
      "Finance transformation teams seeking a platform approach.",
      "IT leaders avoiding isolated point solutions."
    ],
    "related": [
      "business-process-automation",
      "finance-process-automation",
      "ap-workflow-automation"
    ]
  },
  {
    "slug": "business-process-automation",
    "pageName": "Business Process Automation",
    "title": "Business Process Automation (BPA) | Finance & Billing | Oxiom",
    "description": "Use business process automation in finance and billing with Oxiom. Standardize repetitive workflows, reviews, and controls with better visibility.",
    "heading": "Business process automation for finance and billing teams",
    "intro": "Oxiom brings business process automation discipline to finance operations that still rely on manual coordination.",
    "valueProps": [
      "Structured work execution",
      "Cross-functional alignment",
      "Actionable metrics",
      "Continuous improvement"
    ],
    "focus": [
      "workflow templates",
      "task assignments",
      "searchable records",
      "process dashboards"
    ],
    "useCases": [
      "Finance leaders formalizing organic processes.",
      "Organizations creating repeatable operating models.",
      "Finance teams laying groundwork for broader automation."
    ],
    "related": [
      "enterprise-workflow-automation",
      "financial-operations-automation",
      "accounts-payable-automation"
    ]
  },
  {
    "slug": "document-processing-software",
    "pageName": "Billing Document Management",
    "title": "Billing Document Management | Intelligent Automation | Oxiom",
    "description": "Billing document management for finance teams that need intelligent invoice generation, supporting docs, and workflow coordination.",
    "heading": "Billing document management designed for finance operations",
    "intro": "Oxiom helps finance teams keep invoices and their supporting records organized, searchable, and tied to the right customer and payment status.",
    "valueProps": [
      "Invoice to workflow",
      "Document context",
      "Control-friendly processing",
      "Searchable retention"
    ],
    "focus": [
      "invoice and attachment intake",
      "customer-linked records",
      "role-based access",
      "reporting on billing volume"
    ],
    "useCases": [
      "Finance organizations centralizing document-heavy billing.",
      "IT teams replacing disconnected invoicing tools.",
      "Shared services groups serving multiple business units."
    ],
    "related": [
      "intelligent-document-processing",
      "digital-invoice-processing",
      "ocr-invoice-processing"
    ]
  },
  {
    "slug": "invoice-lifecycle-management",
    "pageName": "Invoice Lifecycle Management",
    "title": "Invoice Lifecycle Management | Draft to Paid | Oxiom",
    "description": "Manage the full invoice lifecycle with Oxiom, from draft and review through sending, payment tracking, and historical reporting.",
    "heading": "Invoice lifecycle management from draft to paid",
    "intro": "Oxiom gives finance teams an end-to-end view of how invoices move through the business, from creation to collected payment.",
    "valueProps": [
      "End-to-end visibility",
      "Stage-based governance",
      "Operational accountability",
      "Historical traceability"
    ],
    "focus": [
      "status-aware worklists",
      "stage transitions",
      "audit history",
      "collections reporting"
    ],
    "useCases": [
      "Finance managers reducing bottlenecks across the invoice journey.",
      "Finance teams improving month-end receivables visibility.",
      "Organizations formalizing lifecycle ownership."
    ],
    "related": [
      "invoice-processing-software",
      "accounts-payable-automation",
      "ap-analytics"
    ]
  },
  {
    "slug": "procure-to-pay",
    "pageName": "Order to Cash Automation",
    "title": "Order to Cash (O2C) Automation | End-to-End O2C | Oxiom",
    "description": "Support order-to-cash automation with Oxiom by connecting invoice creation, review, sending, and payment tracking across the billing cycle.",
    "heading": "Order-to-cash automation for tighter finance and sales alignment",
    "intro": "Oxiom strengthens the invoicing and collections layers of the order-to-cash process so finance and sales can work from shared visibility.",
    "valueProps": [
      "Finance and sales alignment",
      "Downstream discipline",
      "Connected visibility",
      "Enterprise readiness"
    ],
    "focus": [
      "order-linked invoicing",
      "billing validation",
      "customer approvals",
      "O2C reporting"
    ],
    "useCases": [
      "Organizations connecting sales agreements with billing execution.",
      "Shared services teams managing recurring and one-time invoices together.",
      "Finance leaders improving downstream O2C visibility."
    ],
    "related": [
      "erp-invoice-integration",
      "invoice-approval-workflow",
      "accounts-payable-automation"
    ]
  },
  {
    "slug": "financial-operations-automation",
    "pageName": "Financial Operations Automation",
    "title": "Financial Operations Automation | FinOps Automation | Oxiom",
    "description": "Financial operations automation for billing and finance teams. Oxiom improves execution, visibility, and controls across invoice-driven processes.",
    "heading": "Financial operations automation for scalable execution and control",
    "intro": "Oxiom helps finance leaders automate operational work that affects accuracy, close timing, and stakeholder responsiveness.",
    "valueProps": [
      "Execution consistency",
      "Data-driven oversight",
      "Control integration",
      "Scalable operations"
    ],
    "focus": [
      "role-based worklists",
      "exception management",
      "operational dashboards",
      "admin controls"
    ],
    "useCases": [
      "Finance organizations increasing transaction volume.",
      "CFO teams improving execution discipline.",
      "Transformation programs building stronger finance operations."
    ],
    "related": [
      "finance-process-automation",
      "business-process-automation",
      "ap-analytics"
    ]
  },
  {
    "slug": "ap-analytics",
    "pageName": "AR Analytics & Insights",
    "title": "AR Analytics & Insights | Receivables Intelligence | Oxiom",
    "description": "Gain accounts receivable analytics and insights with Oxiom. Monitor invoice throughput, aging, DSO, and collections performance with finance-ready visibility.",
    "heading": "AR analytics and insights for better finance decisions",
    "intro": "Oxiom turns day-to-day billing activity into operational intelligence that finance leaders can act on.",
    "valueProps": [
      "Operational visibility",
      "Management insight",
      "Performance improvement",
      "Stakeholder confidence"
    ],
    "focus": [
      "throughput dashboards",
      "aging and DSO analytics",
      "trend analysis",
      "drill-down reporting"
    ],
    "useCases": [
      "Finance leaders reporting on collections performance.",
      "Controllers monitoring receivables and close readiness.",
      "Shared services managers comparing team performance."
    ],
    "related": [
      "invoice-processing-software",
      "supplier-invoice-management",
      "financial-operations-automation",
      "input-tax-credit-recovery"
    ]
  }
];

export function getSolutionPage(slug: string): SolutionPageContent {
  const page = solutionPages.find((item) => item.slug === slug);

  if (!page) {
    throw new Error(`Unknown solution page slug: ${slug}`);
  }

  return page;
}

export function getSolutionMetadata(slug: string): Metadata {
  const page = getSolutionPage(slug);

  return buildMetadata({
    path: `/solutions/${page.slug}`,
    title: page.title,
    description: page.description,
  });
}
