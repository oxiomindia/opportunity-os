import { getItcReconciliationReport } from '../../../../../lib/itcRecovery/report';
import { buildItcReconciliationCsv } from '../../../../../lib/itcRecovery/csv';

export async function GET(request: Request) {
  const period = new URL(request.url).searchParams.get('period') ?? undefined;
  const report = await getItcReconciliationReport(period);
  const csv = buildItcReconciliationCsv(report);
  const filename = `itc-recovery-reconciliation-${period ?? 'all-periods'}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
