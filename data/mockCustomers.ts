import type { Customer } from '../types/customer';

/**
 * Demo-mode customer directory -- reachable only through the local demo
 * login (mode === 'demo', see lib/auth/demo-policy.ts), never the real
 * database. Ten customers across distinct industries so every other demo
 * dataset (invoices, activity) has realistic variety to draw from.
 */
export const mockCustomers: Customer[] = [
  { id: 'cus_1001', name: 'Aarav Cloud Services Pvt Ltd', email: 'billing@aaravcloud.in', phone: '+91 98200 12345', billingAddress: 'Bandra Kurla Complex, Mumbai, IN', taxIdentifier: '27AAACA1234F1Z5', createdAt: '2026-01-08T09:15:00Z' },
  { id: 'cus_1002', name: 'Stratus Analytics LLC', email: 'ap@stratusanalytics.com', phone: '+1 415 555 0142', billingAddress: '500 Market St, San Francisco, CA', taxIdentifier: 'EIN-94-1234567', createdAt: '2026-01-12T14:40:00Z' },
  { id: 'cus_1003', name: 'Bleu Ledger SARL', email: 'factures@bleuledger.fr', phone: '+33 1 42 68 53 00', billingAddress: '12 Rue de Rivoli, Paris, FR', taxIdentifier: 'FR32123456789', createdAt: '2026-01-20T08:05:00Z' },
  { id: 'cus_1004', name: 'Konkan Textile Mills Pvt Ltd', email: 'accounts@konkantextiles.in', phone: '+91 98450 67890', billingAddress: 'MIDC Industrial Area, Nashik, IN', taxIdentifier: '27AABCK5678L1Z9', createdAt: '2026-02-02T10:30:00Z' },
  { id: 'cus_1005', name: 'Sahyadri Healthcare Group', email: 'finance@sahyadrihealth.in', phone: '+91 98220 33445', billingAddress: 'Kothrud, Pune, IN', taxIdentifier: '27AACCS4321M1Z2', createdAt: '2026-02-15T11:00:00Z' },
  { id: 'cus_1006', name: 'Deccan EduTech Solutions', email: 'billing@deccanedutech.in', phone: '+91 98800 22110', billingAddress: 'Whitefield, Bengaluru, IN', taxIdentifier: '29AADCD8765N1Z4', createdAt: '2026-03-01T09:45:00Z' },
  { id: 'cus_1007', name: 'Coastal Foods & Beverages Ltd', email: 'ap@coastalfoods.in', phone: '+91 90040 55667', billingAddress: 'Vashi, Navi Mumbai, IN', taxIdentifier: '27AAECC2345P1Z7', createdAt: '2026-03-10T13:20:00Z' },
  { id: 'cus_1008', name: 'Malabar Realty Developers', email: 'accounts@malabarrealty.in', phone: '+91 98470 99887', billingAddress: 'Marine Drive, Kochi, IN', taxIdentifier: '32AAFCM6789Q1Z1', createdAt: '2026-03-22T08:50:00Z' },
  { id: 'cus_1009', name: 'Solaris Renewable Energy Pvt Ltd', email: 'billing@solarisrenew.in', phone: '+91 90210 44556', billingAddress: 'GIDC Sanand, Ahmedabad, IN', taxIdentifier: '24AAGCS3456R1Z8', createdAt: '2026-04-05T10:10:00Z' },
  { id: 'cus_1010', name: 'Northern Bridge Manufacturing Co', email: 'ap@northernbridge.in', phone: '+91 98140 77889', billingAddress: 'Industrial Estate, Ludhiana, IN', taxIdentifier: '03AAHCN7890S1Z3', createdAt: '2026-04-18T09:00:00Z' },
];
