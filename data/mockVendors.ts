import type { Vendor } from '../types/vendor';

/**
 * Demo-mode vendor directory. Meridian Office Supplies' GSTIN matches
 * data/mockItcPurchaseRecords.ts/mockItcReturnRecords.ts exactly (both
 * previously used different values for the same vendor -- fixed here) so
 * the ITC Recovery demo tells one consistent story.
 */
export const mockVendors: Vendor[] = [
  { id: 'ven_1001', name: 'Meridian Office Supplies Pvt Ltd', email: 'accounts@meridiansupplies.in', phone: '+91 98330 44210', address: 'Andheri East, Mumbai, IN', taxIdentifier: '27AAECM1234F1Z5', createdAt: '2026-01-05T10:00:00Z' },
  { id: 'ven_1002', name: 'Northwind Logistics LLC', email: 'billing@northwindlogistics.com', phone: '+1 206 555 0118', address: '900 4th Ave, Seattle, WA', taxIdentifier: 'EIN-91-2345678', createdAt: '2026-01-10T13:30:00Z' },
  { id: 'ven_1003', name: 'Atelier Digital SARL', email: 'compta@atelierdigital.fr', phone: '+33 1 53 24 60 00', address: '8 Avenue Montaigne, Paris, FR', taxIdentifier: 'FR76987654321', createdAt: '2026-01-15T09:15:00Z' },
  { id: 'ven_1004', name: 'Deccan Precision Components Pvt Ltd', email: 'accounts@deccanprecision.in', phone: '+91 90160 22334', address: 'GIDC Naroda, Ahmedabad, IN', taxIdentifier: '24AAFCA9012H1Z8', createdAt: '2026-02-01T08:40:00Z' },
  { id: 'ven_1005', name: 'Himalayan Packaging Solutions', email: 'ap@himalayanpackaging.in', phone: '+91 98730 55221', address: 'Udyog Vihar, Gurugram, IN', taxIdentifier: '06AABCH2345J1Z6', createdAt: '2026-02-12T11:20:00Z' },
  { id: 'ven_1006', name: 'Coromandel Steel Traders', email: 'accounts@coromandelsteel.in', phone: '+91 94440 88997', address: 'Guindy Industrial Estate, Chennai, IN', taxIdentifier: '33AACCC6789K1Z0', createdAt: '2026-02-24T09:05:00Z' },
  { id: 'ven_1007', name: 'Bluewave IT Consulting Inc', email: 'billing@bluewaveit.com', phone: '+1 512 555 0173', address: '200 Congress Ave, Austin, TX', taxIdentifier: 'EIN-73-4567890', createdAt: '2026-03-08T14:10:00Z' },
  { id: 'ven_1008', name: 'Ganges Agro Exports Pvt Ltd', email: 'ap@gangesagro.in', phone: '+91 98390 66778', address: 'Fazalganj Industrial Area, Kanpur, IN', taxIdentifier: '09AADCG3456L1Z5', createdAt: '2026-03-19T10:35:00Z' },
];
