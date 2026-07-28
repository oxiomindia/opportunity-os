export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  taxIdentifier?: string;
  createdAt: string;
}
