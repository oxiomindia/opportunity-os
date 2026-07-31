import assert from 'node:assert/strict';
import test from 'node:test';
import './bootstrap';
import { listEngines } from './registry';
import { getAuthCapabilities } from '../supabase/config';

test('bootstrap registers the four real platform engines with valid metadata', () => {
  const engines = listEngines();
  const ids = engines.map((engine) => engine.metadata.id).sort();
  assert.deepEqual(ids, ['bills', 'commercial', 'growth-intelligence', 'itc-recovery']);

  for (const engine of engines) {
    assert.ok(engine.metadata.name.length > 0, `${engine.metadata.id} must have a name`);
    assert.ok(engine.metadata.description.length > 0, `${engine.metadata.id} must have a description`);
    assert.ok(engine.metadata.version.length > 0, `${engine.metadata.id} must have a version`);
    assert.ok(Array.isArray(engine.metadata.capabilities), `${engine.metadata.id} must declare capabilities`);
  }
});

test('every Supabase-backed engine reports a health status that reflects real Supabase configuration, not a fabricated constant', async () => {
  // Deliberately not hardcoded: this suite's own CI environment sets real
  // (public-safe) Supabase env vars, so "configured" is true there but false
  // when run locally without them -- the assertion tracks whichever is
  // actually true right now instead of assuming one or the other.
  // growth-intelligence is excluded: it has no Supabase dependency at all
  // (its state is entirely in-process), so it reports unconditionally
  // healthy rather than tracking a signal it doesn't actually depend on --
  // see lib/growth/engine.ts's own doc comment.
  const expectedStatus = getAuthCapabilities(process.env).supabase ? 'healthy' : 'unhealthy';
  for (const engine of listEngines().filter((engine) => engine.metadata.id !== 'growth-intelligence')) {
    const health = await engine.getHealth();
    assert.equal(health.status, expectedStatus, `${engine.metadata.id} health should track real Supabase configuration`);
    assert.ok(health.checkedAt, `${engine.metadata.id} health must include a checkedAt timestamp`);
  }
});

test('growth-intelligence reports unconditionally healthy, honestly reflecting that it has no external dependency to check', async () => {
  const engine = listEngines().find((candidate) => candidate.metadata.id === 'growth-intelligence');
  assert.ok(engine);
  const health = await engine!.getHealth();
  assert.equal(health.status, 'healthy');
  assert.ok(health.checkedAt);
});
