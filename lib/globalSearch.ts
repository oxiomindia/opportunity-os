import { mockActivityEvents } from '../data/mockActivity';
import { mockInvoices } from '../data/mockInvoices';
import { mockVendorInvoices } from '../data/mockVendorInvoices';
import { formatInvoiceCurrency, formatInvoiceDate, getInvoiceStatusLabel } from './invoiceFormatters';
import { formatVendorInvoiceCurrency, formatVendorInvoiceDate, getVendorInvoiceStatusLabel } from './vendorInvoiceFormatters';
import { navigationItems } from '../app/components/workspaceNavigation';
import type { GlobalSearchResult, SearchResultCategory } from '../types/search';

const categoryRank: Record<SearchResultCategory, number> = {
  navigation: 0,
  invoice: 1,
  bill: 1,
  account: 2,
  activity: 3,
  report: 4,
};

const reportResults: GlobalSearchResult[] = [
  {
    id: 'report-operational-overview',
    title: 'Operational reporting',
    description: 'Invoice volume, payment progress, and status mix reporting.',
    category: 'report',
    href: '/reports',
    metadata: ['Reports', 'Analytics', 'Billing KPIs'],
    keywords: ['reports', 'analytics', 'kpi', 'status', 'paid', 'overdue'],
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
      invoice.customerName,
      getInvoiceStatusLabel(invoice.status),
      formatInvoiceCurrency(invoice.total, invoice.currency),
      `Due ${formatInvoiceDate(invoice.dueDate)}`,
    ];

    const invoiceResult: GlobalSearchResult = {
      id: `invoice-${invoice.id}`,
      title: invoice.invoiceNumber,
      description: `${invoice.customerName} invoice for ${formatInvoiceCurrency(invoice.total, invoice.currency)}.`,
      category: 'invoice',
      href: `/invoices/${invoice.id}`,
      metadata: baseMetadata,
      keywords: [invoice.invoiceNumber, invoice.customerName, invoice.status],
    };

    const accountResult: GlobalSearchResult = {
      id: `account-${invoice.customerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: invoice.customerName,
      description: invoice.customerEmail ? `Customer account contact ${invoice.customerEmail}.` : 'Customer account pending contact enrichment.',
      category: 'account',
      href: `/invoices?query=${encodeURIComponent(invoice.customerName)}`,
      metadata: [invoice.customerEmail ?? 'No customer email', invoice.currency],
      keywords: [invoice.customerName, invoice.customerEmail ?? '', invoice.currency, 'customer', 'account'],
    };

    return [invoiceResult, accountResult];
  });
}

function buildVendorInvoiceResults(): GlobalSearchResult[] {
  return mockVendorInvoices.flatMap((bill) => {
    const baseMetadata = [
      bill.vendorName,
      getVendorInvoiceStatusLabel(bill.status),
      formatVendorInvoiceCurrency(bill.total, bill.currency),
      `Due ${formatVendorInvoiceDate(bill.dueDate)}`,
    ];

    const billResult: GlobalSearchResult = {
      id: `bill-${bill.id}`,
      title: bill.vendorInvoiceNumber ?? bill.vendorName,
      description: `${bill.vendorName} bill for ${formatVendorInvoiceCurrency(bill.total, bill.currency)}.`,
      category: 'bill',
      href: `/bills/${bill.id}`,
      metadata: baseMetadata,
      keywords: [bill.vendorInvoiceNumber ?? '', bill.vendorName, bill.status],
    };

    const vendorResult: GlobalSearchResult = {
      id: `account-vendor-${bill.vendorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: bill.vendorName,
      description: bill.vendorEmail ? `Vendor account contact ${bill.vendorEmail}.` : 'Vendor account pending contact enrichment.',
      category: 'account',
      href: `/bills?query=${encodeURIComponent(bill.vendorName)}`,
      metadata: [bill.vendorEmail ?? 'No vendor email', bill.currency],
      keywords: [bill.vendorName, bill.vendorEmail ?? '', bill.currency, 'vendor', 'account'],
    };

    return [billResult, vendorResult];
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
  const allResults = [...buildNavigationResults(), ...buildInvoiceResults(), ...buildVendorInvoiceResults(), ...buildActivityResults(), ...reportResults];
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) return [];

  return allResults
    .map((result) => ({ result, score: scoreResult(result, normalizedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || categoryRank[a.result.category] - categoryRank[b.result.category] || a.result.title.localeCompare(b.result.title))
    .map(({ result }) => result)
    .slice(0, 18);
}
