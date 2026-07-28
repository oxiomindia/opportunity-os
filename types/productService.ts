export type ProductServiceCurrency = 'USD' | 'EUR' | 'INR';

export interface ProductService {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  currency: ProductServiceCurrency;
  active: boolean;
  createdAt: string;
}
