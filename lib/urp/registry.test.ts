import assert from 'node:assert/strict';
import test from 'node:test';
import { clearRegistryForTests, getRegisteredReport, getReportDefinition, getSupportedFormats, listReports, registerReport } from './registry';
import type { OutputFormat, ReportDefinition, ReportTemplate } from './types';

interface FixtureData {
  value: string;
}

function makeFixtureReport(id: string, formats: OutputFormat[] = ['json']): ReportDefinition<{ value?: string }, FixtureData> {
  const templates = Object.fromEntries(
    formats.map((format) => [
      format,
      {
        render: (data: FixtureData) => ({ content: data.value, contentType: 'text/plain', filename: `${id}.${format}` }),
      } satisfies ReportTemplate<FixtureData>,
    ])
  ) as Partial<Record<OutputFormat, ReportTemplate<FixtureData>>>;

  return {
    metadata: { id, name: id, description: '', version: '1.0.0', category: 'test', sourceEngine: 'test-engine', inputSchema: '' },
    validateInput(input) {
      return { ok: true, data: input ?? {} };
    },
    async loadData(input) {
      return { value: input.value ?? 'default' };
    },
    templates,
  };
}

test('registerReport + listReports + getRegisteredReport round-trip', () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('fixture-one'));

  const registered = getRegisteredReport('fixture-one');
  assert.ok(registered);
  assert.equal(registered?.metadata.id, 'fixture-one');
  assert.deepEqual(registered?.supportedFormats, ['json']);
  assert.equal(registered?.status, 'active');
  assert.deepEqual(listReports().map((report) => report.metadata.id), ['fixture-one']);
  assert.equal(getRegisteredReport('does-not-exist'), undefined);
});

test('registering a duplicate report id throws rather than silently overwriting', () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('duplicate'));
  assert.throws(() => registerReport(makeFixtureReport('duplicate')), /already registered/);
});

test('registering a report with zero templates throws', () => {
  clearRegistryForTests();
  assert.throws(() => registerReport(makeFixtureReport('no-templates', [])), /at least one output template/);
});

test("getSupportedFormats reflects each report's declared templates, not a separately-maintained list", () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('multi-format', ['json', 'csv', 'markdown']));
  assert.deepEqual(getSupportedFormats('multi-format').sort(), ['csv', 'json', 'markdown']);
  assert.deepEqual(getSupportedFormats('does-not-exist'), []);
});

test('getReportDefinition exposes the real definition for internal use by the generation pipeline', () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('internal'));
  const definition = getReportDefinition('internal');
  assert.ok(definition);
  assert.equal(typeof definition?.loadData, 'function');
  assert.equal(getReportDefinition('does-not-exist'), undefined);
});

test('listReports reflects every distinct registered report', () => {
  clearRegistryForTests();
  registerReport(makeFixtureReport('one'));
  registerReport(makeFixtureReport('two'));
  assert.deepEqual(listReports().map((report) => report.metadata.id).sort(), ['one', 'two']);
});
