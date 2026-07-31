import type { ProductService } from '../types/productService';

/** Demo-mode catalog spanning the same industries the demo customer/vendor
 * lists cover -- manufacturing, professional services, and subscriptions. */
export const mockProductsServices: ProductService[] = [
  { id: 'pdt_1001', name: 'Implementation Services', description: 'One-time onboarding and setup', sku: 'IMPL-001', unitPrice: 2500, currency: 'USD', active: true, createdAt: '2026-01-08T09:15:00Z' },
  { id: 'pdt_1002', name: 'Monthly Platform Subscription', description: 'Standard tier, billed monthly', sku: 'SUB-STD', unitPrice: 199, currency: 'USD', active: true, createdAt: '2026-01-12T14:40:00Z' },
  { id: 'pdt_1003', name: 'Priority Support Add-on', description: '24/7 response within 1 hour', sku: 'SUP-PRI', unitPrice: 75, currency: 'USD', active: true, createdAt: '2026-01-20T08:05:00Z' },
  { id: 'pdt_1004', name: 'Precision CNC Machined Parts (Batch of 100)', description: 'Aluminum 6061 components, tolerance ±0.02mm', sku: 'MFG-CNC-100', unitPrice: 42000, currency: 'INR', active: true, createdAt: '2026-02-04T10:30:00Z' },
  { id: 'pdt_1005', name: 'GST Compliance Advisory (Monthly Retainer)', description: 'Return filing review and reconciliation support', sku: 'ADV-GST-M', unitPrice: 18000, currency: 'INR', active: true, createdAt: '2026-02-18T11:00:00Z' },
  { id: 'pdt_1006', name: 'Industrial Packaging Rolls (per 500m)', description: 'Corrugated stretch wrap, 20-micron', sku: 'PKG-WRAP-500', unitPrice: 9500, currency: 'INR', active: true, createdAt: '2026-03-02T09:45:00Z' },
  { id: 'pdt_1007', name: 'Enterprise Data Migration Package', description: 'Legacy ERP to Oxiom migration, up to 5 years of records', sku: 'MIG-ENT-01', unitPrice: 6000, currency: 'USD', active: true, createdAt: '2026-03-14T13:20:00Z' },
  { id: 'pdt_1008', name: 'Annual Compliance Audit', description: 'GST + statutory books audit, on-site and remote', sku: 'AUD-ANN-01', unitPrice: 65000, currency: 'INR', active: true, createdAt: '2026-04-01T08:50:00Z' },
];
