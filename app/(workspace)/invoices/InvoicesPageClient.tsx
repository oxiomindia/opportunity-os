'use client';

import { useMemo } from 'react';
import { useInvoiceIntake } from '../../components/InvoiceIntakeProvider';
import type { Invoice } from '../../../types/invoice';
import InvoiceWorklist from './InvoiceWorklist';

export default function InvoicesPageClient({ invoices }: Readonly<{ invoices: Invoice[] }>) {
  const { intakeInvoices } = useInvoiceIntake();
  const mergedInvoices = useMemo(() => {
    const persistedIds = new Set(invoices.map((invoice) => invoice.id));
    return [...intakeInvoices.filter((invoice) => !persistedIds.has(invoice.id)), ...invoices];
  }, [intakeInvoices, invoices]);

  return <InvoiceWorklist invoices={mergedInvoices} />;
}
