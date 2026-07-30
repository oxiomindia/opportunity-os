import assert from 'node:assert/strict';
import test from 'node:test';
import { eventBus } from '../events/bus';
import { generateReport } from './generate';
import { clearRegistryForTests, registerReport } from './registry';
import type { OutputFormat, ReportDefinition, ReportTemplate } from './types';

interface FixtureData {
  value: string;
}

interface FixtureOptions {
  formats?: OutputFormat[];
  failValidation?: boolean;
  throwOnRender?: boolean;
}

function makeFixtureReport(id: string, options: FixtureOptions = {}): ReportDefinition<{ value?: string }, FixtureData> {
  const formats = options.formats ?? ['json'];
  const templates = Object.fromEntries(
    formats.map((format) => [
      format,
      {
        render: (data: FixtureData) => {
          if (options.throwOnRender) throw new Error('render exploded');
          return { content: data.value, contentType: 'text/plain', filename: `${id}.${format}` };
        },
      } satisfies ReportTemplate<FixtureData>,
    ])
  ) as Partial<Record<OutputFormat, ReportTemplate<FixtureData>>>;

  return {
    metadata: { id, name: id, description: '', version: '2.0.0', category: 'test', sourceEngine: 'fixture-engine', inputSchema: '' },
    validateInput(input) {
      if (options.failValidation) return { ok: false, errors: ['always invalid'] };
      return { ok: true, data: input ?? {} };
    },
    async loadData(input) {
      return { value: input?.value ?? 'default' };
    },
    templates,
  };
}

function eventNamesFor(correlationId: string): string[] {
  return eventBus
    .getDiagnostics()
    .recentEvents.filter((event) => event.correlationId === correlationId)
    .map((event) => event.eventName)
    .reverse();
}

test('generateReport runs Structured Input -> Validation -> Template Selection -> Rendering -> Output Generation and returns a Result', async () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('ok-report'));
  const correlationId = `test-ok-${Date.now()}`;

  const result = await generateReport({ reportId: 'ok-report', format: 'json', input: { value: 'hello' }, correlationId });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.report.content, 'hello');
    assert.equal(result.report.filename, 'ok-report.json');
    assert.equal(result.version, '2.0.0');
    assert.equal(result.format, 'json');
  }
});

test('a successful generation publishes report.requested then report.generated, sourced from the report\'s own engine', async () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('event-check'));
  const correlationId = `test-events-${Date.now()}`;

  await generateReport({ reportId: 'event-check', format: 'json', input: {}, correlationId });

  assert.deepEqual(eventNamesFor(correlationId), ['report.requested', 'report.generated']);
  const events = eventBus.getDiagnostics().recentEvents.filter((event) => event.correlationId === correlationId);
  assert.ok(events.every((event) => event.sourceEngine === 'fixture-engine'));
});

test('requesting an unregistered report fails with report.requested then report.failed, sourced from "urp"', async () => {
  clearRegistryForTests();
  const correlationId = `test-missing-${Date.now()}`;

  const result = await generateReport({ reportId: 'does-not-exist', format: 'json', input: {}, correlationId });

  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /not registered/);
  assert.deepEqual(eventNamesFor(correlationId), ['report.requested', 'report.failed']);
  const events = eventBus.getDiagnostics().recentEvents.filter((event) => event.correlationId === correlationId);
  assert.ok(events.every((event) => event.sourceEngine === 'urp'));
});

test('an unsupported format fails and lists the formats that are actually supported', async () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('json-only', { formats: ['json'] }));

  const result = await generateReport({ reportId: 'json-only', format: 'pdf', input: {} });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /does not support format "pdf"/);
    assert.match(result.error, /json/);
  }
});

test('invalid input fails with the report\'s own validation errors', async () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('rejects-input', { failValidation: true }));

  const result = await generateReport({ reportId: 'rejects-input', format: 'json', input: {} });

  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /always invalid/);
});

test('a render-time exception becomes a failed Result, not a thrown error', async () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('exploding', { throwOnRender: true }));

  const result = await generateReport({ reportId: 'exploding', format: 'json', input: {} });

  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /render exploded/);
});
