import type { ItcReturnRecord } from '../types/itcRecovery';

export const mockItcReturnRecords: ItcReturnRecord[] = [
  { id: 'itc_3001', vendorName: 'Meridian Office Supplies Pvt Ltd', vendorGstin: '27AAECM1234F1Z5', returnInvoiceNumber: 'MO-8841', invoiceDate: '2026-07-02', returnPeriod: '2026-07', taxableValue: 42000, taxAmount: 7560, currency: 'INR', source: 'import', createdAt: '2026-07-15T09:00:00Z' },
  { id: 'itc_3002', vendorName: 'Meridian Office Supplies Pvt Ltd', vendorGstin: '27AAECM1234F1Z5', returnInvoiceNumber: 'MO-8790', invoiceDate: '2026-05-20', returnPeriod: '2026-05', taxableValue: 16667, taxAmount: 3000, currency: 'INR', source: 'import', createdAt: '2026-06-15T09:00:00Z' },
  { id: 'itc_3003', vendorName: 'Northwind Logistics LLC', vendorGstin: '29AAFCN5678G1Z2', returnInvoiceNumber: 'NW-11250', invoiceDate: '2026-06-18', returnPeriod: '2026-06', taxableValue: 15000, taxAmount: 2700, currency: 'INR', source: 'manual', createdAt: '2026-07-10T11:20:00Z' },
];
