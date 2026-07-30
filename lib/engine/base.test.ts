import assert from 'node:assert/strict';
import test from 'node:test';
import { BaseEngine } from './base';
import type { EngineHealth, EngineMetadata, EngineStatus } from './types';

class FixtureEngine extends BaseEngine {
  readonly metadata: EngineMetadata = {
    id: 'fixture',
    name: 'Fixture Engine',
    description: 'Test-only engine exercising BaseEngine defaults.',
    version: '0.0.0',
    dependencies: [],
    capabilities: ['a', 'b'],
    inputs: [],
    outputs: [],
    supportedEvents: [],
  };
  getStatus(): EngineStatus {
    return 'active';
  }
  getHealth(): EngineHealth {
    return { status: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' };
  }
}

test('getConfiguration defaults to an empty object', () => {
  assert.deepEqual(new FixtureEngine().getConfiguration(), {});
});

test('validateConfiguration defaults to always-valid', () => {
  assert.deepEqual(new FixtureEngine().validateConfiguration({ anything: 'goes' }), { ok: true, data: true });
});

test('getMetrics defaults to an empty object (no observability infrastructure exists yet)', () => {
  assert.deepEqual(new FixtureEngine().getMetrics(), {});
});

test('discoverCapabilities returns metadata.capabilities by default', () => {
  assert.deepEqual(new FixtureEngine().discoverCapabilities(), ['a', 'b']);
});

test('getDiagnostics composes health, configuration, and metrics', async () => {
  const engine = new FixtureEngine();
  const diagnostics = await engine.getDiagnostics();
  assert.deepEqual(diagnostics, {
    health: { status: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' },
    configuration: {},
    metrics: {},
  });
});

test('lifecycle methods default to no-ops and do not throw', async () => {
  const engine = new FixtureEngine();
  await assert.doesNotReject(() => engine.initialize());
  await assert.doesNotReject(() => engine.start());
  await assert.doesNotReject(() => engine.stop());
  await assert.doesNotReject(() => engine.restart());
});
