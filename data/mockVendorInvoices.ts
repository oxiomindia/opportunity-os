import type { VendorInvoice } from '../types/vendorInvoice';

export const mockVendorInvoices: VendorInvoice[] = [
  { id: 'bill_2001', vendorInvoiceNumber: 'MO-8841', vendorName: 'Meridian Office Supplies Pvt Ltd', vendorEmail: 'accounts@meridiansupplies.in', invoiceDate: '2026-07-02', dueDate: '2026-08-01', currency: 'INR', subtotal: 42000, tax: 7560, total: 49560, status: 'pending-approval', createdAt: '2026-07-03T09:00:00Z' },
  { id: 'bill_2002', vendorInvoiceNumber: 'NW-11290', vendorName: 'Northwind Logistics LLC', vendorEmail: 'billing@northwindlogistics.com', invoiceDate: '2026-06-25', dueDate: '2026-07-25', currency: 'USD', subtotal: 3200, tax: 256, total: 3456, status: 'approved', createdAt: '2026-06-26T11:20:00Z' },
  { id: 'bill_2003', vendorInvoiceNumber: 'AD-0092', vendorName: 'Atelier Digital SARL', vendorEmail: 'compta@atelierdigital.fr', invoiceDate: '2026-06-10', dueDate: '2026-07-10', currency: 'EUR', subtotal: 5400, tax: 1080, total: 6480, status: 'paid', createdAt: '2026-06-11T08:15:00Z' },
  { id: 'bill_2004', vendorInvoiceNumber: 'MO-8790', vendorName: 'Meridian Office Supplies Pvt Ltd', vendorEmail: 'accounts@meridiansupplies.in', invoiceDate: '2026-05-20', dueDate: '2026-06-19', currency: 'INR', subtotal: 18000, tax: 3240, total: 21240, status: 'draft', createdAt: '2026-05-21T10:05:00Z' },
];
