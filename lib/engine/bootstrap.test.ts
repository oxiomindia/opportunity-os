import assert from 'node:assert/strict';
import test from 'node:test';
import './bootstrap';
import { listEngines } from './registry';
import { getAuthCapabilities } from '../supabase/config';

test('bootstrap registers the three real platform engines with valid metadata', () => {
  const engines = listEngines();
  const ids = engines.map((engine) => engine.metadata.id).sort();
  assert.deepEqual(ids, ['bills', 'commercial', 'itc-recovery']);

  for (const engine of engines) {
    assert.ok(engine.metadata.name.length > 0, `${engine.metadata.id} must have a name`);
    assert.ok(engine.metadata.description.length > 0, `${engine.metadata.id} must have a description`);
    assert.ok(engine.metadata.version.length > 0, `${engine.metadata.id} must have a version`);
    assert.ok(Array.isArray(engine.metadata.capabilities), `${engine.metadata.id} must declare capabilities`);
  }
});

test('every registered engine reports a health status that reflects real Supabase configuration, not a fabricated constant', async () => {
  // Deliberately not hardcoded: this suite's own CI environment sets real
  // (public-safe) Supabase env vars, so "configured" is true there but false
  // when run locally without them -- the assertion tracks whichever is
  // actually true right now instead of assuming one or the other.
  const expectedStatus = getAuthCapabilities(process.env).supabase ? 'healthy' : 'unhealthy';
  for (const engine of listEngines()) {
    const health = await engine.getHealth();
    assert.equal(health.status, expectedStatus, `${engine.metadata.id} health should track real Supabase configuration`);
    assert.ok(health.checkedAt, `${engine.metadata.id} health must include a checkedAt timestamp`);
  }
});
