import { getItcReconciliationReport } from '../../../../../lib/itcRecovery/report';
import { renderItcReconciliationPdfBuffer } from '../../../../../lib/itcRecovery/pdf';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const period = new URL(request.url).searchParams.get('period') ?? undefined;
  const report = await getItcReconciliationReport(period);
  const buffer = await renderItcReconciliationPdfBuffer(report);
  const filename = `itc-recovery-reconciliation-${period ?? 'all-periods'}.pdf`;

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
