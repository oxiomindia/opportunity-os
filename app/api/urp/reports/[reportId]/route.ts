import '../../../../../lib/urp/bootstrap';
import { generateReport } from '../../../../../lib/urp/generate';
import type { OutputFormat } from '../../../../../lib/urp/types';

export const runtime = 'nodejs';

const VALID_FORMATS: readonly OutputFormat[] = ['html', 'pdf', 'markdown', 'json', 'csv'];

interface RouteParams {
  params: Promise<{ reportId: string }>;
}

/**
 * Generic delivery endpoint for any report registered with URP -- proves
 * the generation pipeline against real, running code rather than only a
 * test fixture. Auth is not duplicated here: each report's own loadData
 * (e.g. getItcReconciliationReport, which calls requireSessionContext())
 * enforces it exactly as the existing dedicated export routes already do.
 *
 * Additive only: the existing /api/itc-recovery/export/{csv,pdf} routes
 * are untouched and keep serving those two formats exactly as before.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { reportId } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get('format') ?? 'json';

  if (!VALID_FORMATS.includes(format as OutputFormat)) {
    return new Response(`Unsupported format "${format}". Supported: ${VALID_FORMATS.join(', ')}`, { status: 400 });
  }

  const input: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (key === 'format') continue;
    input[key] = value;
  }

  const result = await generateReport({ reportId, format: format as OutputFormat, input });

  if (!result.ok) {
    const status = result.error.includes('is not registered') ? 404 : 400;
    return new Response(result.error, { status });
  }

  const body = Buffer.isBuffer(result.report.content) ? new Uint8Array(result.report.content) : result.report.content;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': result.report.contentType,
      'Content-Disposition': `attachment; filename="${result.report.filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
