import assert from 'node:assert/strict';
import test from 'node:test';
import '../engine/bootstrap';
import { listEngines } from '../engine/registry';
import type { EngineHealth } from '../engine/types';
import { eventBus } from './bus';
import type { PlatformEvent } from './types';

test('every registered engine declares engine.health-checked in supportedEvents', () => {
  for (const engine of listEngines()) {
    assert.ok(
      engine.metadata.supportedEvents.includes('engine.health-checked'),
      `${engine.metadata.id} should declare engine.health-checked in metadata.supportedEvents`
    );
  }
});

test("an engine's getHealth() publishes exactly one engine.health-checked event on the shared bus, without changing its own return value", async () => {
  for (const engine of listEngines()) {
    const received: PlatformEvent<{ status: string; health: EngineHealth }>[] = [];
    const unsubscribe = eventBus.subscribe<{ status: string; health: EngineHealth }>(
      'engine.health-checked',
      (event) => {
        received.push(event);
      },
      { sourceEngine: engine.metadata.id }
    );

    const health = await engine.getHealth();
    unsubscribe();

    assert.equal(received.length, 1, `${engine.metadata.id}.getHealth() should publish exactly one engine.health-checked event`);
    assert.equal(received[0].sourceEngine, engine.metadata.id);
    assert.deepEqual(received[0].payload.health, health, "the published payload's health must be identical to getHealth()'s own return value");
  }
});
