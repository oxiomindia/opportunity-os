import { mockActivityEvents } from '../data/mockActivity';
import { mockInvoices } from '../data/mockInvoices';
import { formatInvoiceCurrency, formatInvoiceDate, getInvoiceStatusLabel } from './invoiceFormatters';
import { navigationItems } from '../app/components/workspaceNavigation';
import type { GlobalSearchResult, SearchResultCategory } from '../types/search';

const categoryRank: Record<SearchResultCategory, number> = {
  navigation: 0,
  invoice: 1,
  verification: 2,
  payment: 3,
  account: 4,
  activity: 5,
  report: 6,
};

const reportResults: GlobalSearchResult[] = [
  {
    id: 'report-operational-overview',
    title: 'Operational reporting',
    description: 'Invoice throughput, exception rate, confidence, status mix, and intake source reporting.',
    category: 'report',
    href: '/reports',
    metadata: ['Reports', 'Analytics', 'Workflow KPIs'],
    keywords: ['reports', 'analytics', 'kpi', 'throughput', 'confidence', 'exceptions', 'status', 'source'],
  },
  {
    id: 'report-payment-readiness',
    title: 'Payment readiness report',
    description: 'Review approved, payment-ready, and paid invoice movement for treasury operations.',
    category: 'report',
    href: '/payment-queue',
    metadata: ['Payment Queue', 'Treasury', 'Ready to pay'],
    keywords: ['payment', 'queue', 'treasury', 'paid', 'approved', 'export'],
  },
];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function scoreResult(result: GlobalSearchResult, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  const fields = [result.title, result.description, result.category, ...result.metadata, ...result.keywords].map(normalize);
  return fields.reduce((score, field) => {
    if (field === normalizedQuery) return score + 20;
    if (field.startsWith(normalizedQuery)) return score + 10;
    if (field.includes(normalizedQuery)) return score + 4;
    return score;
  }, 0);
}

function buildInvoiceResults(): GlobalSearchResult[] {
  return mockInvoices.flatMap((invoice) => {
    const baseMetadata = [
      invoice.vendorName,
      getInvoiceStatusLabel(invoice.status),
      formatInvoiceCurrency(invoice.total, invoice.currency),
      `Due ${formatInvoiceDate(invoice.dueDate)}`,
      `${invoice.confidence}% confidence`,
    ];

    const invoiceResult: GlobalSearchResult = {
      id: `invoice-${invoice.id}`,
      title: invoice.invoiceNumber,
      description: `${invoice.vendorName} invoice for ${formatInvoiceCurrency(invoice.total, invoice.currency)} with ${invoice.exceptionCount} exceptions.`,
      category: 'invoice',
      href: `/invoices/${invoice.id}`,
      metadata: baseMetadata,
      keywords: [invoice.invoiceNumber, invoice.vendorName, invoice.fileName, invoice.status, invoice.source, invoice.assignedTo ?? 'unassigned'],
    };

    const accountResult: GlobalSearchResult = {
      id: `account-${invoice.vendorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: invoice.vendorName,
      description: invoice.vendorEmail ? `Vendor account contact ${invoice.vendorEmail}.` : 'Vendor account pending contact enrichment.',
      category: 'account',
      href: `/invoices?query=${encodeURIComponent(invoice.vendorName)}`,
      metadata: [invoice.vendorEmail ?? 'No vendor email', invoice.currency, invoice.source.replace('-', ' ')],
      keywords: [invoice.vendorName, invoice.vendorEmail ?? '', invoice.currency, invoice.source, 'vendor', 'account'],
    };

    const workflowResult: GlobalSearchResult | null = invoice.status === 'payment-ready' || invoice.status === 'approved' || invoice.status === 'paid'
      ? {
          id: `payment-${invoice.id}`,
          title: `${invoice.invoiceNumber} payment status`,
          description: `${getInvoiceStatusLabel(invoice.status)} invoice owned by ${invoice.assignedTo ?? 'Treasury'}.`,
          category: 'payment',
          href: '/payment-queue',
          metadata: [formatInvoiceCurrency(invoice.total, invoice.currency), `Due ${formatInvoiceDate(invoice.dueDate)}`],
          keywords: [invoice.invoiceNumber, invoice.vendorName, 'payment', 'treasury', invoice.status],
        }
      : invoice.status === 'received' || invoice.status === 'processing' || invoice.status === 'needs-review' || invoice.status === 'verified'
        ? {
            id: `verification-${invoice.id}`,
            title: `${invoice.invoiceNumber} verification`,
            description: `${invoice.confidence}% confidence with ${invoice.exceptionCount} extraction exceptions.`,
            category: 'verification',
            href: '/verification',
            metadata: [invoice.vendorName, getInvoiceStatusLabel(invoice.status), `${invoice.exceptionCount} exceptions`],
            keywords: [invoice.invoiceNumber, invoice.vendorName, 'verification', 'review', 'confidence', invoice.status],
          }
        : null;

    return workflowResult ? [invoiceResult, accountResult, workflowResult] : [invoiceResult, accountResult];
  });
}

function buildNavigationResults(): GlobalSearchResult[] {
  return navigationItems.map((item) => ({
    id: `nav-${item.href}`,
    title: item.label,
    description: item.description,
    category: 'navigation',
    href: item.href,
    metadata: ['Workspace destination'],
    keywords: [item.label, item.description, item.href.replace('/', '')],
  }));
}

function buildActivityResults(): GlobalSearchResult[] {
  return mockActivityEvents.map((event) => ({
    id: `activity-${event.id}`,
    title: event.title,
    description: event.description,
    category: 'activity',
    href: event.href ?? '/activity',
    metadata: [event.actor, event.severity, event.category, event.unread ? 'Unread' : 'Read'],
    keywords: [event.title, event.description, event.actor, event.severity, event.category],
  }));
}

export function getGlobalSearchResults(query: string) {
  const allResults = [...buildNavigationResults(), ...buildInvoiceResults(), ...buildActivityResults(), ...reportResults];
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) return [];

  return allResults
    .map((result) => ({ result, score: scoreResult(result, normalizedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || categoryRank[a.result.category] - categoryRank[b.result.category] || a.result.title.localeCompare(b.result.title))
    .map(({ result }) => result)
    .slice(0, 18);
}
