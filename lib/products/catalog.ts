import type { Product, ProductCategoryDef } from './types';

/**
 * The full Oxiom product categories. Adding a new category requires only a
 * new entry here — ProductCategorySection renders one section per category
 * automatically, so no homepage/page structure changes are needed.
 */
export const productCategories: ProductCategoryDef[] = [
  {
    id: 'accounts-payable',
    label: 'Accounts Payable',
    description: 'Automate what you owe — from vendor bill to payment.',
  },
  {
    id: 'accounts-receivable',
    label: 'Accounts Receivable',
    description: 'Automate what you’re owed — from invoice to collection.',
  },
  {
    id: 'finance-suite',
    label: 'Finance Suite',
    description: 'The complete Oxiom platform, unified in one workspace.',
  },
  {
    id: 'compliance-automation',
    label: 'Compliance & Recovery Automation',
    description: 'Purpose-built automation for regulatory and recovery workflows.',
  },
];

/**
 * The full Oxiom product catalog. Adding a fifth, tenth, or fiftieth
 * product requires only a new entry here — every page that lists or
 * renders products (homepage, /platform, /platform/[slug]) reads from
 * this array and needs no further changes.
 */
export const products: Product[] = [
  {
    id: 'accounts-payable',
    brand: 'Oxiom',
    name: 'Accounts Payable',
    categoryId: 'accounts-payable',
    tagline: 'Automate vendor bills from intake to payment.',
    description:
      'Oxiom Accounts Payable gives finance teams a single, controlled workspace for every vendor bill — from intake and validation through approval and payment. Replace scattered inboxes and spreadsheets with a workflow built for accountability.',
    highlights: [
      'Centralized vendor management and records',
      'Role-based approval workflow with a full audit trail',
      'Payment scheduling and status tracking',
      'File attachments and supporting documentation on every bill',
    ],
    status: 'live',
    icon: 'accounts-payable',
    learnMoreHref: '/platform/accounts-payable',
    bookDemoHref: '/book-demo?product=accounts-payable',
  },
  {
    id: 'accounts-receivable',
    brand: 'Oxiom',
    name: 'Accounts Receivable',
    categoryId: 'accounts-receivable',
    tagline: 'Invoice customers and get paid faster.',
    description:
      'Oxiom Accounts Receivable gives finance teams one place to build invoices from a reusable customer and product catalog, send them, and track every invoice from draft to paid — with sequential, audit-ready invoice numbering built in.',
    highlights: [
      'Reusable customer and product/service catalog',
      'Sequential, per-organization invoice numbering',
      'Professional PDF invoice generation',
      'Status tracking from draft to sent to paid',
    ],
    status: 'live',
    icon: 'accounts-receivable',
    learnMoreHref: '/platform/accounts-receivable',
    bookDemoHref: '/book-demo?product=accounts-receivable',
  },
  {
    id: 'finance-suite',
    brand: 'Oxiom',
    name: 'Finance Suite',
    categoryId: 'finance-suite',
    tagline: 'Accounts Payable and Accounts Receivable, together in one workspace.',
    description:
      'Oxiom Finance Suite combines Accounts Payable and Accounts Receivable into a single unified workspace — one login, one dashboard, one source of truth for what you owe and what you’re owed. Built for finance teams that need the full picture.',
    highlights: [
      'Combined AP and AR dashboard and reporting',
      'One workspace, one login, one team',
      'Consolidated visibility across payables and receivables',
      'Everything in Accounts Payable and Accounts Receivable, unified',
    ],
    status: 'live',
    badge: 'Most Popular',
    icon: 'finance-suite',
    learnMoreHref: '/platform/finance-suite',
    bookDemoHref: '/book-demo?product=finance-suite',
  },
  {
    id: 'itc-recovery-bot',
    brand: 'Oxiom',
    name: 'ITC Recovery Bot',
    categoryId: 'compliance-automation',
    tagline: 'Automated input tax credit recovery and reconciliation.',
    description:
      'Oxiom ITC Recovery Bot automates the reconciliation of input tax credit against purchase records and filed returns — reducing manual GST reconciliation work and helping finance teams recover eligible credit they might otherwise miss. Currently in development.',
    highlights: [
      'Automated purchase-to-return reconciliation',
      'Built for Indian GST input tax credit workflows',
      'Audit-ready reconciliation trail',
      'Early access available for design partners',
    ],
    status: 'coming-soon',
    icon: 'itc-recovery',
    learnMoreHref: '/platform/itc-recovery-bot',
    bookDemoHref: '/book-demo?product=itc-recovery-bot',
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getCategoryById(id: string): ProductCategoryDef | undefined {
  return productCategories.find((category) => category.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((product) => product.categoryId === categoryId);
}

/** Categories that currently have at least one product, in catalog order. */
export function getActiveCategories(): ProductCategoryDef[] {
  return productCategories.filter((category) => getProductsByCategory(category.id).length > 0);
}
