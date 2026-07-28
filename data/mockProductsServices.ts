import type { ProductService } from '../types/productService';

export const mockProductsServices: ProductService[] = [
  { id: 'pdt_1001', name: 'Implementation Services', description: 'One-time onboarding and setup', sku: 'IMPL-001', unitPrice: 2500, currency: 'USD', active: true, createdAt: '2026-06-01T09:15:00Z' },
  { id: 'pdt_1002', name: 'Monthly Platform Subscription', description: 'Standard tier, billed monthly', sku: 'SUB-STD', unitPrice: 199, currency: 'USD', active: true, createdAt: '2026-06-05T14:40:00Z' },
  { id: 'pdt_1003', name: 'Priority Support Add-on', description: '24/7 response within 1 hour', sku: 'SUP-PRI', unitPrice: 75, currency: 'USD', active: true, createdAt: '2026-06-10T08:05:00Z' },
];
