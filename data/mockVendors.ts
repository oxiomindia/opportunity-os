import type { Vendor } from '../types/vendor';

export const mockVendors: Vendor[] = [
  { id: 'ven_1001', name: 'Meridian Office Supplies Pvt Ltd', email: 'accounts@meridiansupplies.in', phone: '+91 98330 44210', address: 'Andheri East, Mumbai, IN', taxIdentifier: 'GSTIN27AAACM5678K1Z2', createdAt: '2026-05-12T10:00:00Z' },
  { id: 'ven_1002', name: 'Northwind Logistics LLC', email: 'billing@northwindlogistics.com', phone: '+1 206 555 0118', address: '900 4th Ave, Seattle, WA', taxIdentifier: 'EIN-91-2345678', createdAt: '2026-05-20T13:30:00Z' },
  { id: 'ven_1003', name: 'Atelier Digital SARL', email: 'compta@atelierdigital.fr', phone: '+33 1 53 24 60 00', address: '8 Avenue Montaigne, Paris, FR', taxIdentifier: 'FR76987654321', createdAt: '2026-05-28T09:15:00Z' },
];
