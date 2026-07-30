export interface ItcReturnRecord {
  id: string;
  vendorId?: string;
  vendorName: string;
  vendorGstin: string;
  returnInvoiceNumber: string;
  invoiceDate?: string;
  returnPeriod: string;
  taxableValue: number;
  taxAmount: number;
  currency: string;
  source: 'manual' | 'import';
  createdAt: string;
}
