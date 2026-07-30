import assert from 'node:assert/strict';
import test from 'node:test';
import { BaseEngine } from './base';
import { clearRegistryForTests, getEngine, listEngines, registerEngine } from './registry';
import type { EngineHealth, EngineMetadata, EngineStatus } from './types';

function makeFixtureEngine(id: string): BaseEngine {
  class FixtureEngine extends BaseEngine {
    readonly metadata: EngineMetadata = { id, name: id, description: '', version: '0.0.0', dependencies: [], capabilities: [], inputs: [], outputs: [], supportedEvents: [] };
    getStatus(): EngineStatus {
      return 'active';
    }
    getHealth(): EngineHealth {
      return { status: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' };
    }
  }
  return new FixtureEngine();
}

test('registerEngine + listEngines + getEngine round-trip', () => {
  clearRegistryForTests();
  const engine = makeFixtureEngine('fixture-one');
  registerEngine(engine);

  assert.deepEqual(listEngines(), [engine]);
  assert.equal(getEngine('fixture-one'), engine);
  assert.equal(getEngine('does-not-exist'), undefined);
});

test('registering a duplicate engine id throws rather than silently overwriting', () => {
  clearRegistryForTests();
  registerEngine(makeFixtureEngine('duplicate'));
  assert.throws(() => registerEngine(makeFixtureEngine('duplicate')), /already registered/);
});

test('listEngines reflects every distinct registered engine', () => {
  clearRegistryForTests();
  registerEngine(makeFixtureEngine('one'));
  registerEngine(makeFixtureEngine('two'));
  assert.deepEqual(listEngines().map((engine) => engine.metadata.id).sort(), ['one', 'two']);
});
