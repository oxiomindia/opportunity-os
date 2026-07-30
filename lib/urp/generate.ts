import { unstable_rethrow } from 'next/navigation';
import { eventBus } from '../events/bus';
import { getReportDefinition } from './registry';
import type { GenerateReportInput, GenerateReportResult } from './types';

/**
 * The standard generation pipeline every report goes through, regardless
 * of source engine or output format:
 *
 *   Structured Input -> Validation -> Template Selection -> Rendering ->
 *   Output Generation -> Result
 *
 * Publishes report.requested up front, then exactly one of
 * report.generated / report.failed, on the shared Event Bus
 * (lib/events/bus.ts) -- URP is a consumer of that existing infrastructure,
 * not a second event mechanism.
 */
export async function generateReport(request: GenerateReportInput): Promise<GenerateReportResult> {
  const { reportId, format, input, correlationId } = request;
  const definition = getReportDefinition(reportId);

  await eventBus.publish({
    eventName: 'report.requested',
    sourceEngine: definition?.metadata.sourceEngine ?? 'urp',
    payload: { reportId, format },
    correlationId,
  });

  if (!definition) {
    return fail(reportId, format, `Report "${reportId}" is not registered.`, 'urp', correlationId);
  }

  const sourceEngine = definition.metadata.sourceEngine;

  // Template Selection
  const template = definition.templates[format];
  if (!template) {
    const supported = Object.keys(definition.templates).join(', ');
    return fail(reportId, format, `Report "${reportId}" does not support format "${format}". Supported formats: ${supported}.`, sourceEngine, correlationId);
  }

  // Validation
  const validation = definition.validateInput(input as never);
  if (!validation.ok) {
    return fail(reportId, format, `Invalid input for report "${reportId}": ${validation.errors.join('; ')}`, sourceEngine, correlationId);
  }

  try {
    // Rendering (loadData is the "structured input becomes report data"
    // step every template then renders from -- one fetch, many formats)
    const data = await definition.loadData(validation.data);
    // Output Generation
    const rendered = await template.render(data);

    await eventBus.publish({
      eventName: 'report.generated',
      sourceEngine,
      payload: { reportId, format, filename: rendered.filename },
      correlationId,
    });

    return { ok: true, reportId, format, version: definition.metadata.version, report: rendered };
  } catch (error) {
    // A report's loadData commonly delegates to an existing engine
    // function that enforces auth via redirect()/notFound() (e.g.
    // requireSessionContext()) -- those throw Next.js's own internal
    // control-flow errors, which must propagate to the framework, not be
    // swallowed into a report.failed result. unstable_rethrow re-throws
    // exactly those and is a no-op for a real application error.
    unstable_rethrow(error);
    const message = error instanceof Error ? error.message : String(error);
    return fail(reportId, format, `Report "${reportId}" failed to generate: ${message}`, sourceEngine, correlationId);
  }
}

async function fail(
  reportId: string,
  format: GenerateReportInput['format'],
  error: string,
  sourceEngine: string,
  correlationId: string | undefined
): Promise<GenerateReportResult> {
  await eventBus.publish({
    eventName: 'report.failed',
    sourceEngine,
    payload: { reportId, format, error },
    correlationId,
  });
  return { ok: false, reportId, format, error };
}
