import type { VendorInvoice } from '../types/vendorInvoice';

/** Demo-mode Bills (AP). bill_2001-2004 are the original set; bill_2005
 * onward were added for status/vendor variety and to give
 * data/mockItcPurchaseRecords.ts's "Missing in Return" ITC scenario
 * (bill_2005) a real bill to link to instead of a dangling reference. */
export const mockVendorInvoices: VendorInvoice[] = [
  { id: 'bill_2001', vendorInvoiceNumber: 'MO-8841', vendorName: 'Meridian Office Supplies Pvt Ltd', vendorEmail: 'accounts@meridiansupplies.in', invoiceDate: '2026-07-02', dueDate: '2026-08-01', currency: 'INR', subtotal: 42000, tax: 7560, total: 49560, status: 'pending-approval', createdAt: '2026-07-03T09:00:00Z' },
  { id: 'bill_2002', vendorInvoiceNumber: 'NW-11290', vendorName: 'Northwind Logistics LLC', vendorEmail: 'billing@northwindlogistics.com', invoiceDate: '2026-06-25', dueDate: '2026-07-25', currency: 'USD', subtotal: 3200, tax: 256, total: 3456, status: 'approved', createdAt: '2026-06-26T11:20:00Z' },
  { id: 'bill_2003', vendorInvoiceNumber: 'AD-0092', vendorName: 'Atelier Digital SARL', vendorEmail: 'compta@atelierdigital.fr', invoiceDate: '2026-06-10', dueDate: '2026-07-10', currency: 'EUR', subtotal: 5400, tax: 1080, total: 6480, status: 'paid', createdAt: '2026-06-11T08:15:00Z' },
  { id: 'bill_2004', vendorInvoiceNumber: 'MO-8790', vendorName: 'Meridian Office Supplies Pvt Ltd', vendorEmail: 'accounts@meridiansupplies.in', invoiceDate: '2026-05-20', dueDate: '2026-06-19', currency: 'INR', subtotal: 18000, tax: 3240, total: 21240, status: 'draft', createdAt: '2026-05-21T10:05:00Z' },
  { id: 'bill_2005', vendorInvoiceNumber: 'DP-2210', vendorName: 'Deccan Precision Components Pvt Ltd', vendorEmail: 'accounts@deccanprecision.in', invoiceDate: '2026-07-10', dueDate: '2026-08-09', currency: 'INR', subtotal: 6000, tax: 1080, total: 7080, status: 'approved', createdAt: '2026-07-11T09:30:00Z' },
  { id: 'bill_2006', vendorInvoiceNumber: 'HP-3301', vendorName: 'Himalayan Packaging Solutions', vendorEmail: 'ap@himalayanpackaging.in', invoiceDate: '2026-06-15', dueDate: '2026-07-15', currency: 'INR', subtotal: 22000, tax: 1100, total: 23100, status: 'payment-scheduled', paymentScheduledDate: '2026-07-20', createdAt: '2026-06-16T10:15:00Z' },
  { id: 'bill_2007', vendorInvoiceNumber: 'CS-7745', vendorName: 'Coromandel Steel Traders', vendorEmail: 'accounts@coromandelsteel.in', invoiceDate: '2026-06-01', dueDate: '2026-07-01', currency: 'INR', subtotal: 84000, tax: 15120, total: 99120, status: 'partially-paid', createdAt: '2026-06-02T08:45:00Z' },
  { id: 'bill_2008', vendorInvoiceNumber: 'BW-0021', vendorName: 'Bluewave IT Consulting Inc', vendorEmail: 'billing@bluewaveit.com', invoiceDate: '2026-05-10', dueDate: '2026-06-09', currency: 'USD', subtotal: 4000, tax: 0, total: 4000, status: 'void', createdAt: '2026-05-11T13:00:00Z' },
  { id: 'bill_2009', vendorInvoiceNumber: 'GA-5567', vendorName: 'Ganges Agro Exports Pvt Ltd', vendorEmail: 'ap@gangesagro.in', invoiceDate: '2026-07-01', dueDate: '2026-07-31', currency: 'INR', subtotal: 36000, tax: 4320, total: 40320, status: 'paid', createdAt: '2026-07-02T09:20:00Z' },
];
