import { listProductsServices } from '../../../lib/products/repository';
import ProductsPageClient from './ProductsPageClient';

export const metadata = {
  title: 'Products & Services | Oxiom',
  description: 'Manage the products and services you bill customers for on the Oxiom platform.',
};

export default async function ProductsPage() {
  return <ProductsPageClient items={await listProductsServices()} />;
}
