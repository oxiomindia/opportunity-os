import type { PurchaseRecord } from '../types/itcRecovery';

/**
 * Demo-mode purchase side of a reconciliation. Vendor names/invoice
 * numbers/amounts intentionally line up with data/mockVendorInvoices.ts so
 * the demo dashboard tells one consistent story, but this list carries the
 * vendor GSTIN the matching logic needs, which the bills mock data doesn't.
 */
export const mockItcPurchaseRecords: PurchaseRecord[] = [
  { vendorInvoiceId: 'bill_2001', vendorName: 'Meridian Office Supplies Pvt Ltd', vendorGstin: '27AAECM1234F1Z5', invoiceNumber: 'MO-8841', invoiceDate: '2026-07-02', taxAmount: 7560, currency: 'INR' },
  { vendorInvoiceId: 'bill_2002', vendorName: 'Northwind Logistics LLC', vendorGstin: '29AAFCN5678G1Z2', invoiceNumber: 'NW-11290', invoiceDate: '2026-06-25', taxAmount: 256, currency: 'USD' },
  { vendorInvoiceId: 'bill_2004', vendorName: 'Meridian Office Supplies Pvt Ltd', vendorGstin: '27AAECM1234F1Z5', invoiceNumber: 'MO-8790', invoiceDate: '2026-05-20', taxAmount: 3240, currency: 'INR' },
  // No corresponding itc_return_records entry -- demonstrates "Missing in Return": tax claimed on a booked
  // purchase invoice that hasn't shown up in a filed return yet.
  { vendorInvoiceId: 'bill_2005', vendorName: 'Atelier Digital SARL', vendorGstin: '24AAFCA9012H1Z8', invoiceNumber: 'AD-0140', invoiceDate: '2026-07-10', taxAmount: 1080, currency: 'INR' },
];
