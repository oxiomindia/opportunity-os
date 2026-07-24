'use client';

import { useMemo } from 'react';
import { useInvoiceIntake } from '../../components/InvoiceIntakeProvider';
import type { Invoice } from '../../../types/invoice';
import InvoiceWorklist from './InvoiceWorklist';

export default function InvoicesPageClient({ invoices }: Readonly<{ invoices: Invoice[] }>) {
  const { intakeInvoices } = useInvoiceIntake();
  const mergedInvoices = useMemo(() => [...intakeInvoices, ...invoices], [intakeInvoices, invoices]);

  return <InvoiceWorklist invoices={mergedInvoices} />;
}
