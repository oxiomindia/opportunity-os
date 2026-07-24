import { notFound } from 'next/navigation';
import { mockInvoices } from '../../../../data/mockInvoices';
import ExtractionDetailWorkspace from './ExtractionDetailWorkspace';

export default async function ExtractionDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const isKnownMockInvoice = mockInvoices.some((invoice) => invoice.id === id);
  const isClientOnlyUploadRecord = id.startsWith('temp-upload-');
  if (!isKnownMockInvoice && !isClientOnlyUploadRecord) notFound();

  return <ExtractionDetailWorkspace invoiceId={id} />;
}
