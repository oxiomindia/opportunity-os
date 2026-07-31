import type { VendorInvoiceLineItem } from '../types/vendorInvoice';

/** Line items for each demo bill in data/mockVendorInvoices.ts, keyed by
 * bill id -- previously getVendorInvoiceLineItems() always returned []
 * in demo mode; this is what it now reads from. */
export const mockVendorInvoiceLineItems: Record<string, VendorInvoiceLineItem[]> = {
  bill_2001: [{ id: 'bill_2001_li_1', description: 'Office furniture and supplies bundle', quantity: 1, unitPrice: 42000, taxAmount: 7560, lineTotal: 42000 }],
  bill_2002: [{ id: 'bill_2002_li_1', description: 'International freight and logistics services', quantity: 1, unitPrice: 3200, taxAmount: 256, lineTotal: 3200 }],
  bill_2003: [{ id: 'bill_2003_li_1', description: 'Web design and digital consulting', quantity: 1, unitPrice: 5400, taxAmount: 1080, lineTotal: 5400 }],
  bill_2004: [{ id: 'bill_2004_li_1', description: 'Office supplies restock', quantity: 1, unitPrice: 18000, taxAmount: 3240, lineTotal: 18000 }],
  bill_2005: [{ id: 'bill_2005_li_1', description: 'CNC machined mounting brackets, 50 units', quantity: 50, unitPrice: 120, taxAmount: 1080, lineTotal: 6000 }],
  bill_2006: [{ id: 'bill_2006_li_1', description: 'Corrugated stretch wrap rolls, 500m x 4', quantity: 4, unitPrice: 5500, taxAmount: 1100, lineTotal: 22000 }],
  bill_2007: [{ id: 'bill_2007_li_1', description: 'Mild steel sheets, 2mm, 40 units', quantity: 40, unitPrice: 2100, taxAmount: 15120, lineTotal: 84000 }],
  bill_2008: [{ id: 'bill_2008_li_1', description: 'Cloud migration consulting (cancelled)', quantity: 1, unitPrice: 4000, taxAmount: 0, lineTotal: 4000 }],
  bill_2009: [{ id: 'bill_2009_li_1', description: 'Packaged grain exports -- domestic component', quantity: 1, unitPrice: 36000, taxAmount: 4320, lineTotal: 36000 }],
};
