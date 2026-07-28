import { requireSessionContext } from '../../../../../lib/auth/dal';
import { getInvoice, getInvoiceLineItems } from '../../../../../lib/invoices/repository';
import { renderInvoicePdfBuffer } from '../../../../../lib/pdf/InvoicePdfDocument';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const [{ organization }, invoice] = await Promise.all([requireSessionContext(), getInvoice(id)]);
  if (!invoice) return new Response('Invoice not found', { status: 404 });

  const lineItems = await getInvoiceLineItems(id);
  const buffer = await renderInvoicePdfBuffer({ invoice, lineItems, organizationName: organization.name });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
