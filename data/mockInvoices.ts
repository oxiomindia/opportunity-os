import type { Invoice } from '../types/invoice';

export const mockInvoices: Invoice[] = [
  { id: 'inv_1001', invoiceNumber: 'OX-2026-1001', customerName: 'Aarav Cloud Services Pvt Ltd', customerEmail: 'billing@aaravcloud.in', invoiceDate: '2026-07-01', dueDate: '2026-07-31', currency: 'INR', subtotal: 184500, tax: 33210, total: 217710, status: 'sent', createdAt: '2026-07-02T09:15:00Z' },
  { id: 'inv_1002', invoiceNumber: 'OX-2026-1002', customerName: 'Stratus Analytics LLC', customerEmail: 'ap@stratusanalytics.com', invoiceDate: '2026-06-28', dueDate: '2026-07-28', currency: 'USD', subtotal: 12800, tax: 1024, total: 13824, status: 'paid', createdAt: '2026-06-29T14:40:00Z' },
  { id: 'inv_1003', invoiceNumber: 'OX-2026-1003', customerName: 'Bleu Ledger SARL', customerEmail: 'factures@bleuledger.fr', invoiceDate: '2026-07-03', dueDate: '2026-08-02', currency: 'EUR', subtotal: 9400, tax: 1880, total: 11280, status: 'draft', createdAt: '2026-07-04T08:05:00Z' },
  { id: 'inv_1004', invoiceNumber: 'OX-2026-1004', customerName: 'Aarav Cloud Services Pvt Ltd', customerEmail: 'billing@aaravcloud.in', invoiceDate: '2026-06-05', dueDate: '2026-06-20', currency: 'INR', subtotal: 60000, tax: 10800, total: 70800, status: 'overdue', createdAt: '2026-06-05T17:30:00Z' },
  { id: 'inv_1005', invoiceNumber: 'OX-2026-1005', customerName: 'Stratus Analytics LLC', customerEmail: 'ap@stratusanalytics.com', invoiceDate: '2026-07-08', dueDate: '2026-08-07', currency: 'USD', subtotal: 5000, tax: 400, total: 5400, status: 'partially-paid', createdAt: '2026-07-08T10:10:00Z' },
];
