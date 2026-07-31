import { mockCustomers } from './mockCustomers';
import type { Invoice, InvoiceCurrency, InvoiceLineItem, InvoiceStatus, InvoiceTaxLine } from '../types/invoice';

/**
 * Single source of truth for the 25 demo invoices: each spec lists real
 * line items (quantity, unit price, optional discount) and a GST
 * treatment; data/mockInvoices.ts and data/mockInvoiceLineItems.ts both
 * derive their exported shapes from this file's computeInvoiceSet()
 * rather than hand-typing subtotal/tax/total twice (once here, once
 * there) with the risk of the two drifting out of arithmetic agreement.
 *
 * gst.type mirrors real Indian GST: 'intra' (buyer in the same state as
 * the seller) splits the rate into CGST + SGST; 'inter' (different state)
 * is a single IGST line; 'none' is an export/foreign customer with no
 * GST. The demo seller (Oxiom Demo Manufacturing Pvt Ltd, see
 * lib/auth/dev-session.ts) is modeled as Maharashtra-based.
 */

interface LineItemSpec {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

interface InvoiceSpec {
  id: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  currency: InvoiceCurrency;
  status: InvoiceStatus;
  gst: { type: 'intra' | 'inter' | 'none'; rate: number };
  items: LineItemSpec[];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function invoiceNumberFor(id: string): string {
  return `OX-2026-${id.replace('inv_', '')}`;
}

const specs: InvoiceSpec[] = [
  { id: 'inv_2001', customerId: 'cus_1001', invoiceDate: '2026-01-05', dueDate: '2026-02-04', currency: 'INR', status: 'paid', gst: { type: 'intra', rate: 18 }, items: [{ description: 'Implementation Services -- onboarding and setup', quantity: 1, unitPrice: 210000 }] },
  { id: 'inv_2002', customerId: 'cus_1002', invoiceDate: '2026-01-07', dueDate: '2026-02-06', currency: 'USD', status: 'paid', gst: { type: 'none', rate: 0 }, items: [{ description: 'Monthly Platform Subscription -- Jan & Feb', quantity: 2, unitPrice: 199 }, { description: 'Priority Support Add-on', quantity: 1, unitPrice: 75 }] },
  { id: 'inv_2003', customerId: 'cus_1003', invoiceDate: '2026-01-10', dueDate: '2026-02-09', currency: 'EUR', status: 'sent', gst: { type: 'none', rate: 0 }, items: [{ description: 'Ledger consolidation consulting, 12 hours', quantity: 12, unitPrice: 140 }] },
  { id: 'inv_2004', customerId: 'cus_1004', invoiceDate: '2026-01-15', dueDate: '2026-02-14', currency: 'INR', status: 'paid', gst: { type: 'intra', rate: 12 }, items: [{ description: 'Textile loom spare parts, assorted', quantity: 40, unitPrice: 1250 }] },
  { id: 'inv_2005', customerId: 'cus_1005', invoiceDate: '2026-01-20', dueDate: '2026-02-19', currency: 'INR', status: 'overdue', gst: { type: 'intra', rate: 18 }, items: [{ description: 'Diagnostic equipment annual maintenance contract', quantity: 1, unitPrice: 185000, discount: 5000 }] },
  { id: 'inv_2006', customerId: 'cus_1006', invoiceDate: '2026-01-25', dueDate: '2026-02-24', currency: 'INR', status: 'paid', gst: { type: 'inter', rate: 18 }, items: [{ description: 'EdTech platform licensing -- 500 seats', quantity: 500, unitPrice: 240 }] },
  { id: 'inv_2007', customerId: 'cus_1007', invoiceDate: '2026-02-01', dueDate: '2026-03-03', currency: 'INR', status: 'viewed', gst: { type: 'intra', rate: 5 }, items: [{ description: 'Food-grade packaging cartons, 10000 units', quantity: 10000, unitPrice: 9.5 }] },
  { id: 'inv_2008', customerId: 'cus_1008', invoiceDate: '2026-02-05', dueDate: '2026-03-07', currency: 'INR', status: 'sent', gst: { type: 'inter', rate: 18 }, items: [{ description: 'Real estate transaction advisory retainer', quantity: 1, unitPrice: 95000 }] },
  { id: 'inv_2009', customerId: 'cus_1009', invoiceDate: '2026-02-10', dueDate: '2026-03-12', currency: 'INR', status: 'partially-paid', gst: { type: 'inter', rate: 18 }, items: [{ description: 'Solar inverter units, 5kW', quantity: 20, unitPrice: 32000 }, { description: 'Installation labor', quantity: 20, unitPrice: 1500 }] },
  { id: 'inv_2010', customerId: 'cus_1010', invoiceDate: '2026-02-14', dueDate: '2026-03-16', currency: 'INR', status: 'overdue', gst: { type: 'inter', rate: 12 }, items: [{ description: 'Precision machined bridge components', quantity: 15, unitPrice: 8800 }] },
  { id: 'inv_2011', customerId: 'cus_1001', invoiceDate: '2026-02-18', dueDate: '2026-03-20', currency: 'INR', status: 'paid', gst: { type: 'intra', rate: 18 }, items: [{ description: 'Priority Support Add-on, Q1', quantity: 3, unitPrice: 15000 }] },
  { id: 'inv_2012', customerId: 'cus_1002', invoiceDate: '2026-02-20', dueDate: '2026-03-22', currency: 'USD', status: 'partially-paid', gst: { type: 'none', rate: 0 }, items: [{ description: 'Enterprise Data Migration Package', quantity: 1, unitPrice: 6000 }] },
  { id: 'inv_2013', customerId: 'cus_1004', invoiceDate: '2026-02-25', dueDate: '2026-03-27', currency: 'INR', status: 'void', gst: { type: 'intra', rate: 12 }, items: [{ description: 'Cancelled order -- duplicate raised in error', quantity: 1, unitPrice: 18000 }] },
  { id: 'inv_2014', customerId: 'cus_1005', invoiceDate: '2026-03-01', dueDate: '2026-03-31', currency: 'INR', status: 'paid', gst: { type: 'intra', rate: 18 }, items: [{ description: 'GST Compliance Advisory -- monthly retainer', quantity: 1, unitPrice: 18000 }] },
  { id: 'inv_2015', customerId: 'cus_1006', invoiceDate: '2026-03-05', dueDate: '2026-04-04', currency: 'INR', status: 'sent', gst: { type: 'inter', rate: 18 }, items: [{ description: 'Additional EdTech platform licenses -- 150 seats', quantity: 150, unitPrice: 240 }] },
  { id: 'inv_2016', customerId: 'cus_1007', invoiceDate: '2026-03-10', dueDate: '2026-04-09', currency: 'INR', status: 'paid', gst: { type: 'intra', rate: 5 }, items: [{ description: 'Food-grade packaging refill order', quantity: 6000, unitPrice: 9.5 }] },
  { id: 'inv_2017', customerId: 'cus_1008', invoiceDate: '2026-03-15', dueDate: '2026-04-14', currency: 'INR', status: 'overdue', gst: { type: 'inter', rate: 18 }, items: [{ description: 'Annual Compliance Audit', quantity: 1, unitPrice: 65000 }] },
  { id: 'inv_2018', customerId: 'cus_1009', invoiceDate: '2026-03-20', dueDate: '2026-04-19', currency: 'INR', status: 'paid', gst: { type: 'inter', rate: 18 }, items: [{ description: 'Solar inverter units, 5kW -- batch 2', quantity: 10, unitPrice: 32000 }] },
  { id: 'inv_2019', customerId: 'cus_1010', invoiceDate: '2026-03-25', dueDate: '2026-04-24', currency: 'INR', status: 'viewed', gst: { type: 'inter', rate: 12 }, items: [{ description: 'Precision machined bridge components -- batch 2', quantity: 22, unitPrice: 8800, discount: 4000 }] },
  { id: 'inv_2020', customerId: 'cus_1001', invoiceDate: '2026-04-01', dueDate: '2026-05-01', currency: 'INR', status: 'partially-paid', gst: { type: 'intra', rate: 18 }, items: [{ description: 'Monthly Platform Subscription -- Standard tier', quantity: 1, unitPrice: 16000 }] },
  { id: 'inv_2021', customerId: 'cus_1003', invoiceDate: '2026-04-05', dueDate: '2026-05-05', currency: 'EUR', status: 'paid', gst: { type: 'none', rate: 0 }, items: [{ description: 'Ledger consolidation consulting, phase 2', quantity: 16, unitPrice: 140 }] },
  { id: 'inv_2022', customerId: 'cus_1004', invoiceDate: '2026-04-10', dueDate: '2026-05-10', currency: 'INR', status: 'draft', gst: { type: 'intra', rate: 12 }, items: [{ description: 'Draft quote -- textile loom spare parts', quantity: 25, unitPrice: 1250 }] },
  { id: 'inv_2023', customerId: 'cus_1005', invoiceDate: '2026-04-15', dueDate: '2026-05-15', currency: 'INR', status: 'sent', gst: { type: 'intra', rate: 18 }, items: [{ description: 'Annual healthcare compliance audit', quantity: 1, unitPrice: 72000 }] },
  { id: 'inv_2024', customerId: 'cus_1006', invoiceDate: '2026-04-20', dueDate: '2026-05-20', currency: 'INR', status: 'overdue', gst: { type: 'inter', rate: 18 }, items: [{ description: 'Faculty training package -- 3 day onsite', quantity: 3, unitPrice: 28000 }] },
  { id: 'inv_2025', customerId: 'cus_1007', invoiceDate: '2026-04-25', dueDate: '2026-05-25', currency: 'INR', status: 'partially-paid', gst: { type: 'intra', rate: 5 }, items: [{ description: 'Bulk food-grade packaging order', quantity: 15000, unitPrice: 9.5, discount: 2500 }] },
];

function customerFor(customerId: string) {
  const customer = mockCustomers.find((entry) => entry.id === customerId);
  if (!customer) throw new Error(`mockInvoiceSpecs: unknown customerId "${customerId}"`);
  return customer;
}

function computeLineItems(spec: InvoiceSpec): InvoiceLineItem[] {
  return spec.items.map((item, index) => ({
    id: `${spec.id}_li_${index + 1}`,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount,
    lineTotal: round2(item.quantity * item.unitPrice - (item.discount ?? 0)),
  }));
}

function computeTax(subtotal: number, gst: InvoiceSpec['gst']): { tax: number; taxBreakdown?: InvoiceTaxLine[] } {
  if (gst.type === 'none' || gst.rate === 0) return { tax: 0 };
  if (gst.type === 'inter') {
    const amount = round2((subtotal * gst.rate) / 100);
    return { tax: amount, taxBreakdown: [{ name: 'IGST', rate: gst.rate, taxableAmount: subtotal, amount }] };
  }
  const halfRate = gst.rate / 2;
  const cgst = round2((subtotal * halfRate) / 100);
  const sgst = round2((subtotal * halfRate) / 100);
  return {
    tax: round2(cgst + sgst),
    taxBreakdown: [
      { name: 'CGST', rate: halfRate, taxableAmount: subtotal, amount: cgst },
      { name: 'SGST', rate: halfRate, taxableAmount: subtotal, amount: sgst },
    ],
  };
}

interface ComputedInvoiceSet {
  invoices: Invoice[];
  lineItemsByInvoiceId: Record<string, InvoiceLineItem[]>;
}

function computeInvoiceSet(): ComputedInvoiceSet {
  const invoices: Invoice[] = [];
  const lineItemsByInvoiceId: Record<string, InvoiceLineItem[]> = {};

  for (const spec of specs) {
    const customer = customerFor(spec.customerId);
    const lineItems = computeLineItems(spec);
    const subtotal = round2(lineItems.reduce((sum, item) => sum + item.lineTotal, 0));
    const { tax, taxBreakdown } = computeTax(subtotal, spec.gst);

    lineItemsByInvoiceId[spec.id] = lineItems;
    invoices.push({
      id: spec.id,
      invoiceNumber: invoiceNumberFor(spec.id),
      customerName: customer.name,
      customerEmail: customer.email,
      invoiceDate: spec.invoiceDate,
      dueDate: spec.dueDate,
      currency: spec.currency,
      subtotal,
      tax,
      taxBreakdown,
      total: round2(subtotal + tax),
      status: spec.status,
      createdAt: `${spec.invoiceDate}T09:00:00Z`,
    });
  }

  return { invoices, lineItemsByInvoiceId };
}

export const { invoices: computedMockInvoices, lineItemsByInvoiceId: computedMockInvoiceLineItems } = computeInvoiceSet();
