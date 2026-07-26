import type { Metadata } from 'next';

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
    "slug": "vendor-invoice-processing",
    "pageName": "Vendor Invoice Processing",
    "title": "Vendor Invoice Processing Software | Automate Supplier Invoices | Oxiom",
    "description": "Streamline vendor invoice processing with Oxiom. Capture supplier invoices, automate coding and approvals, and keep AP teams aligned across locations.",
    "heading": "Vendor invoice processing software built for enterprise AP teams",
    "intro": "Oxiom gives finance leaders a single operating layer for supplier invoice intake, validation, approval, and handoff to payment.",
    "valueProps": [
      "Centralized intake",
      "Supplier-ready workflows",
      "Operational visibility",
      "Faster cycle times"
    ],
    "focus": [
      "supplier documents",
      "approval routing",
      "duplicate prevention",
      "ERP handoff"
    ],
    "useCases": [
      "Shared services teams managing high supplier volume.",
      "Manufacturers coordinating invoices across plants.",
      "Fast-growing companies replacing email-based AP workflows."
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
    "title": "Invoice Processing Software | End-to-End AP Automation | Oxiom",
    "description": "Modern invoice processing software for end-to-end AP automation. Manage capture, review, approvals, and payment-ready workflows in Oxiom.",
    "heading": "End-to-end invoice processing software for modern finance operations",
    "intro": "Oxiom Invoice Processing helps AP teams manage the full lifecycle of an invoice in one platform with governance, visibility, and measurable throughput.",
    "valueProps": [
      "One workflow backbone",
      "Finance-first controls",
      "Scalable operations",
      "Better decision support"
    ],
    "focus": [
      "lifecycle management",
      "exception handling",
      "searchable worklists",
      "operational dashboards"
    ],
    "useCases": [
      "Mid-market AP teams leaving manual processes behind.",
      "Enterprises standardizing AP across entities.",
      "Finance leaders improving month-end visibility."
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
    "title": "AI-Powered Invoice Processing | Intelligent Automation | Oxiom",
    "description": "Use AI-powered invoice processing to accelerate AP operations. Oxiom supports intelligent classification, data extraction, and exception prioritization.",
    "heading": "AI-powered invoice processing that improves speed and control",
    "intro": "Oxiom applies intelligent automation to repetitive AP work so teams can focus on exceptions, supplier relationships, and financial oversight.",
    "valueProps": [
      "Smarter extraction",
      "Better prioritization",
      "Learning workflows",
      "Human oversight"
    ],
    "focus": [
      "AI extraction",
      "confidence scoring",
      "exception prioritization",
      "review feedback loops"
    ],
    "useCases": [
      "Teams processing mixed-format supplier invoices.",
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
    "pageName": "Intelligent Document Processing",
    "title": "Intelligent Document Processing (IDP) | Oxiom",
    "description": "Oxiom delivers intelligent document processing for finance teams that need reliable extraction, validation, and workflow automation for invoice documents.",
    "heading": "Intelligent document processing for invoice-driven finance workflows",
    "intro": "Oxiom combines extraction, validation, and workflow orchestration so invoice documents become structured AP work instead of static files.",
    "valueProps": [
      "Document understanding",
      "Workflow orchestration",
      "Quality control",
      "Enterprise scale"
    ],
    "focus": [
      "document classification",
      "normalized fields",
      "review queues",
      "searchable archives"
    ],
    "useCases": [
      "Global teams consolidating invoice document handling.",
      "IT leaders replacing scan-only tools.",
      "Finance groups standardizing intake across entities."
    ],
    "related": [
      "document-processing-software",
      "invoice-capture",
      "ai-invoice-processing"
    ]
  },
  {
    "slug": "accounts-payable-automation",
    "pageName": "Accounts Payable Automation",
    "title": "Accounts Payable Automation Software | AP Automation | Oxiom",
    "description": "Automate accounts payable workflows with Oxiom. Improve invoice throughput, strengthen controls, and reduce manual work across AP operations.",
    "heading": "Accounts payable automation software for controlled growth",
    "intro": "Oxiom helps finance organizations modernize AP without sacrificing policy compliance, visibility, or audit readiness.",
    "valueProps": [
      "Process standardization",
      "Faster approvals",
      "Audit discipline",
      "Cash flow visibility"
    ],
    "focus": [
      "automated intake",
      "approval workflows",
      "exception queues",
      "ERP exports"
    ],
    "useCases": [
      "Teams scaling AP after acquisitions.",
      "Organizations replacing paper approvals.",
      "CFO teams tightening control over liabilities."
    ],
    "related": [
      "ap-workflow-automation",
      "procure-to-pay",
      "financial-operations-automation"
    ]
  },
  {
    "slug": "ap-workflow-automation",
    "pageName": "AP Workflow Automation",
    "title": "AP Workflow Automation | Streamline Approval Processes | Oxiom",
    "description": "Streamline AP workflow automation with configurable routing, escalations, and visibility for invoice approvals, reviews, and exception handling.",
    "heading": "AP workflow automation that keeps invoices moving",
    "intro": "Oxiom automates the handoffs that slow invoice processing down with configurable routing, escalations, and ownership visibility.",
    "valueProps": [
      "Configurable routing",
      "Escalation management",
      "Clear ownership",
      "Consistent controls"
    ],
    "focus": [
      "approval rules",
      "task assignment",
      "escalation triggers",
      "workflow analytics"
    ],
    "useCases": [
      "Distributed enterprises with layered approver structures.",
      "AP managers reducing approval delays.",
      "Finance teams formalizing delegation rules."
    ],
    "related": [
      "invoice-approval-workflow",
      "accounts-payable-automation",
      "enterprise-workflow-automation"
    ]
  },
  {
    "slug": "supplier-invoice-management",
    "pageName": "Supplier Invoice Management",
    "title": "Supplier Invoice Management | Centralize Vendor Invoices | Oxiom",
    "description": "Centralize supplier invoice management with Oxiom. Gain visibility into vendor submissions, approvals, exceptions, and payment readiness across AP teams.",
    "heading": "Supplier invoice management with stronger visibility and control",
    "intro": "Oxiom gives AP teams a unified way to manage vendor invoices from receipt through payment preparation.",
    "valueProps": [
      "Vendor-centric records",
      "Central AP visibility",
      "Collaboration support",
      "Operational resilience"
    ],
    "focus": [
      "supplier invoice repository",
      "vendor-level views",
      "exception routing",
      "supplier reporting"
    ],
    "useCases": [
      "AP organizations managing thousands of suppliers.",
      "Procurement and AP teams resolving discrepancies together.",
      "Shared services groups improving supplier experience."
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
    "title": "Invoice Approval Workflow Software | Multi-Level Approvals | Oxiom",
    "description": "Manage invoice approval workflows with Oxiom. Support multi-level approvals, delegation, escalations, and audit-ready review histories.",
    "heading": "Invoice approval workflow software for multi-level enterprise review",
    "intro": "Oxiom helps finance teams formalize invoice approvals without making the process harder for business stakeholders.",
    "valueProps": [
      "Approval policy alignment",
      "Flexible escalation",
      "Full traceability",
      "Faster routing"
    ],
    "focus": [
      "multi-level routing",
      "delegated approvals",
      "decision history",
      "bottleneck visibility"
    ],
    "useCases": [
      "Enterprises enforcing delegated authority matrices.",
      "Teams reducing payment delays from unclear ownership.",
      "Organizations with layered approval hierarchies."
    ],
    "related": [
      "ap-workflow-automation",
      "invoice-validation",
      "procure-to-pay"
    ]
  },
  {
    "slug": "invoice-capture",
    "pageName": "Invoice Capture",
    "title": "Invoice Capture Technology | Automated Data Extraction | Oxiom",
    "description": "Capture invoices digitally with Oxiom. Centralize intake, automate classification, and prepare invoice data for validation and downstream AP workflows.",
    "heading": "Invoice capture technology that organizes intake from day one",
    "intro": "Oxiom provides a controlled front door for invoice intake so AP teams can stop losing time to scattered inboxes and manual handling.",
    "valueProps": [
      "Unified intake",
      "Document readiness",
      "Operational consistency",
      "Immediate visibility"
    ],
    "focus": [
      "digital uploads",
      "shared mailbox intake",
      "metadata capture",
      "source document retention"
    ],
    "useCases": [
      "Teams replacing paper or manual scanning.",
      "Organizations consolidating invoice submission channels.",
      "Finance groups seeking better receipt visibility."
    ],
    "related": [
      "ocr-invoice-processing",
      "intelligent-document-processing",
      "digital-invoice-processing"
    ]
  },
  {
    "slug": "ocr-invoice-processing",
    "pageName": "OCR Invoice Processing",
    "title": "OCR Invoice Processing | Extract Invoice Data Automatically | Oxiom",
    "description": "Use OCR invoice processing to extract invoice data automatically. Oxiom helps AP teams reduce manual entry and improve document throughput.",
    "heading": "OCR invoice processing for cleaner, faster AP data capture",
    "intro": "Oxiom uses OCR-enabled workflows to convert invoice documents into structured AP data and reduce repetitive keying.",
    "valueProps": [
      "Automated extraction",
      "Review by exception",
      "Data consistency",
      "Faster processing"
    ],
    "focus": [
      "header capture",
      "layout support",
      "confidence review",
      "searchable metadata"
    ],
    "useCases": [
      "AP teams spending too much time rekeying invoices.",
      "Organizations moving from basic scanning to structured records.",
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
    "description": "Automate invoice validation with business rules in Oxiom. Catch duplicates, missing fields, policy issues, and data mismatches before approval.",
    "heading": "Invoice validation software that strengthens AP controls",
    "intro": "Oxiom helps finance teams validate invoices before they move deeper into the approval process.",
    "valueProps": [
      "Control-first processing",
      "Duplicate defense",
      "Exception clarity",
      "Reliable readiness"
    ],
    "focus": [
      "required field checks",
      "duplicate detection",
      "tolerance rules",
      "exception reporting"
    ],
    "useCases": [
      "AP teams enforcing stricter controls before posting.",
      "Organizations reducing duplicate payment risk.",
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
    "pageName": "ERP Invoice Integration",
    "title": "ERP Invoice Integration | SAP, Oracle, NetSuite | Oxiom",
    "description": "Connect Oxiom with ERP systems for invoice integration. Support finance workflows across SAP, Oracle, NetSuite, and other enterprise platforms.",
    "heading": "ERP invoice integration that keeps AP workflows connected",
    "intro": "Oxiom fits into enterprise finance architecture by connecting invoice operations to ERP master data and downstream posting processes.",
    "valueProps": [
      "Connected data flow",
      "Less swivel-chair work",
      "Governed handoff",
      "Flexible architecture"
    ],
    "focus": [
      "master data alignment",
      "export mappings",
      "sync exceptions",
      "integration governance"
    ],
    "useCases": [
      "IT and finance teams deploying AP automation alongside ERP investments.",
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
    "description": "Automate finance processes with Oxiom. Improve invoice operations, approvals, controls, and reporting across shared services and enterprise teams.",
    "heading": "Finance process automation that starts with invoice operations",
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
    "pageName": "Digital Invoice Processing",
    "title": "Digital Invoice Processing | Paperless AP Automation | Oxiom",
    "description": "Move to digital invoice processing with Oxiom. Replace paper, email, and spreadsheet-driven AP workflows with a controlled paperless process.",
    "heading": "Digital invoice processing for paperless AP operations",
    "intro": "Oxiom helps finance teams shift from paper-heavy and email-heavy invoice handling to a digital process built for scale.",
    "valueProps": [
      "Paperless intake",
      "Accessible records",
      "Modern workflow control",
      "Audit-ready storage"
    ],
    "focus": [
      "digital intake",
      "status-linked records",
      "paperless approvals",
      "retention support"
    ],
    "useCases": [
      "Organizations retiring paper-based AP processes.",
      "Remote or hybrid approvers needing digital access.",
      "Shared services groups centralizing records."
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
    "description": "Enterprise workflow automation for finance teams on the Oxiom One platform. Standardize approvals, controls, and process visibility across operations.",
    "heading": "Enterprise workflow automation for controlled finance execution",
    "intro": "Oxiom One provides workflow automation patterns that help enterprise teams coordinate work reliably across business units and control functions.",
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
      "Enterprises standardizing approvals after organizational change.",
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
    "title": "Business Process Automation (BPA) | Finance & AP | Oxiom",
    "description": "Use business process automation in finance and AP with Oxiom. Standardize repetitive workflows, approvals, and controls with better visibility.",
    "heading": "Business process automation for finance and AP teams",
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
      "AP teams laying groundwork for broader automation."
    ],
    "related": [
      "enterprise-workflow-automation",
      "financial-operations-automation",
      "accounts-payable-automation"
    ]
  },
  {
    "slug": "document-processing-software",
    "pageName": "Document Processing Software",
    "title": "Document Processing Software | Intelligent Automation | Oxiom",
    "description": "Document processing software for finance teams that need intelligent capture, validation, and workflow coordination for invoices and related records.",
    "heading": "Document processing software designed for finance operations",
    "intro": "Oxiom helps finance teams transform high-volume invoice documents into structured, actionable records.",
    "valueProps": [
      "Capture to workflow",
      "Document context",
      "Control-friendly processing",
      "Searchable retention"
    ],
    "focus": [
      "email and scan intake",
      "classification and extraction",
      "role-based access",
      "reporting on document volume"
    ],
    "useCases": [
      "Finance organizations centralizing document-heavy AP operations.",
      "IT teams replacing disconnected scan repositories.",
      "Shared services groups serving multiple entities."
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
    "title": "Invoice Lifecycle Management | Capture to Payment | Oxiom",
    "description": "Manage the full invoice lifecycle with Oxiom, from capture and validation through approval, payment readiness, and historical reporting.",
    "heading": "Invoice lifecycle management from capture to payment readiness",
    "intro": "Oxiom gives finance teams an end-to-end view of how invoices move through the business.",
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
      "throughput reporting"
    ],
    "useCases": [
      "AP managers reducing bottlenecks across the invoice journey.",
      "Finance teams improving month-end liability visibility.",
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
    "pageName": "Procure to Pay Automation",
    "title": "Procure to Pay (P2P) Automation | End-to-End P2P | Oxiom",
    "description": "Support procure-to-pay automation with Oxiom by connecting invoice workflows, approvals, controls, and ERP handoff across the AP cycle.",
    "heading": "Procure-to-pay automation for tighter finance and procurement alignment",
    "intro": "Oxiom strengthens the downstream invoice and approval layers of the procure-to-pay process so finance and procurement can work from shared controls.",
    "valueProps": [
      "AP and procurement alignment",
      "Downstream discipline",
      "Connected visibility",
      "Enterprise readiness"
    ],
    "focus": [
      "PO and non-PO workflows",
      "purchasing validation",
      "stakeholder approvals",
      "P2P reporting"
    ],
    "useCases": [
      "Organizations connecting procurement controls with AP execution.",
      "Shared services teams managing PO and non-PO invoices together.",
      "Finance leaders improving downstream P2P visibility."
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
    "description": "Financial operations automation for AP and finance teams. Oxiom improves execution, visibility, and controls across invoice-driven processes.",
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
    "pageName": "AP Analytics & Insights",
    "title": "AP Analytics & Insights | Accounts Payable Intelligence | Oxiom",
    "description": "Gain AP analytics and insights with Oxiom. Monitor invoice throughput, exceptions, approvals, aging, and team performance with finance-ready visibility.",
    "heading": "AP analytics and insights for better finance decisions",
    "intro": "Oxiom turns day-to-day invoice activity into operational intelligence that finance leaders can act on.",
    "valueProps": [
      "Operational visibility",
      "Management insight",
      "Performance improvement",
      "Stakeholder confidence"
    ],
    "focus": [
      "throughput dashboards",
      "exception analytics",
      "trend analysis",
      "drill-down reporting"
    ],
    "useCases": [
      "AP leaders reporting service levels.",
      "Controllers monitoring liabilities and close readiness.",
      "Shared services managers comparing team performance."
    ],
    "related": [
      "invoice-processing-software",
      "supplier-invoice-management",
      "financial-operations-automation"
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

  return {
    title: page.title,
    description: page.description,
  };
}
