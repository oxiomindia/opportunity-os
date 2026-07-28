'use client';

import type { Invoice } from '../../../types/invoice';
import InvoiceWorklist from './InvoiceWorklist';

export default function InvoicesPageClient({ invoices }: Readonly<{ invoices: Invoice[] }>) {
  return <InvoiceWorklist invoices={invoices} />;
}
