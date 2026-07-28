import type { Customer } from '../types/customer';

export const mockCustomers: Customer[] = [
  { id: 'cus_1001', name: 'Aarav Cloud Services Pvt Ltd', email: 'billing@aaravcloud.in', phone: '+91 98200 12345', billingAddress: 'Bandra Kurla Complex, Mumbai, IN', taxIdentifier: 'GSTIN27AAACA1234F1Z5', createdAt: '2026-06-01T09:15:00Z' },
  { id: 'cus_1002', name: 'Stratus Analytics LLC', email: 'ap@stratusanalytics.com', phone: '+1 415 555 0142', billingAddress: '500 Market St, San Francisco, CA', taxIdentifier: 'EIN-94-1234567', createdAt: '2026-06-05T14:40:00Z' },
  { id: 'cus_1003', name: 'Bleu Ledger SARL', email: 'factures@bleuledger.fr', phone: '+33 1 42 68 53 00', billingAddress: '12 Rue de Rivoli, Paris, FR', taxIdentifier: 'FR32123456789', createdAt: '2026-06-10T08:05:00Z' },
];
