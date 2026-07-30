import assert from 'node:assert/strict';
import test from 'node:test';
import { EventBus, eventBus } from './bus';
import type { PlatformEvent } from './types';

test('the shared eventBus singleton is an EventBus instance', () => {
  assert.ok(eventBus instanceof EventBus);
});

test('publish + subscribe round trip delivers a fully-formed event', async () => {
  const bus = new EventBus();
  const received: PlatformEvent[] = [];
  bus.subscribe('widget.created', (event) => {
    received.push(event);
  });

  const result = await bus.publish({ eventName: 'widget.created', sourceEngine: 'widgets', payload: { id: 'w1' } });

  assert.equal(received.length, 1);
  const [event] = received;
  assert.equal(event.eventName, 'widget.created');
  assert.equal(event.sourceEngine, 'widgets');
  assert.deepEqual(event.payload, { id: 'w1' });
  assert.equal(event.eventType, 'domain-event');
  assert.equal(event.version, '1.0.0');
  assert.ok(event.eventId);
  assert.ok(event.timestamp);
  assert.equal(event.correlationId, event.eventId, 'correlationId defaults to the event\'s own id when not supplied');
  assert.equal(result.status, 'delivered');
  assert.equal(result.deliveredTo, 1);
  assert.deepEqual(result.failed, []);
});

test('an explicit correlationId is preserved rather than defaulted', async () => {
  const bus = new EventBus();
  let seen: PlatformEvent | undefined;
  bus.subscribe('order.paid', (event) => {
    seen = event;
  });
  await bus.publish({ eventName: 'order.paid', sourceEngine: 'orders', payload: {}, correlationId: 'corr-123' });
  assert.equal(seen?.correlationId, 'corr-123');
});

test('multiple subscribers to the same event all receive it independently', async () => {
  const bus = new EventBus();
  let countA = 0;
  let countB = 0;
  bus.subscribe('ping', () => {
    countA += 1;
  });
  bus.subscribe('ping', () => {
    countB += 1;
  });

  await bus.publish({ eventName: 'ping', sourceEngine: 'test', payload: null });

  assert.equal(countA, 1);
  assert.equal(countB, 1);
});

test('a wildcard ("*") subscription receives every event regardless of name', async () => {
  const bus = new EventBus();
  const names: string[] = [];
  bus.subscribe('*', (event) => {
    names.push(event.eventName);
  });

  await bus.publish({ eventName: 'a.happened', sourceEngine: 'test', payload: null });
  await bus.publish({ eventName: 'b.happened', sourceEngine: 'test', payload: null });

  assert.deepEqual(names, ['a.happened', 'b.happened']);
});

test('a sourceEngine filter narrows delivery to matching events only', async () => {
  const bus = new EventBus();
  let received = 0;
  bus.subscribe('health.checked', () => {
    received += 1;
  }, { sourceEngine: 'bills' });

  await bus.publish({ eventName: 'health.checked', sourceEngine: 'commercial', payload: null });
  assert.equal(received, 0, 'event from a non-matching sourceEngine must not be delivered');

  await bus.publish({ eventName: 'health.checked', sourceEngine: 'bills', payload: null });
  assert.equal(received, 1);
});

test('one failing subscriber does not prevent delivery to the others (error isolation)', async () => {
  const bus = new EventBus();
  let goodHandlerRan = false;
  bus.subscribe('risky', () => {
    throw new Error('boom');
  });
  bus.subscribe('risky', () => {
    goodHandlerRan = true;
  });

  const result = await bus.publish({ eventName: 'risky', sourceEngine: 'test', payload: null });

  assert.equal(goodHandlerRan, true);
  assert.equal(result.deliveredTo, 1);
  assert.equal(result.failed.length, 1);
  assert.match(result.failed[0].error, /boom/);
  assert.equal(result.status, 'partial-failure');
});

test('publishing with zero matching subscribers reports status "no-subscribers"', async () => {
  const bus = new EventBus();
  const result = await bus.publish({ eventName: 'nobody.listens', sourceEngine: 'test', payload: null });
  assert.equal(result.status, 'no-subscribers');
  assert.equal(result.deliveredTo, 0);
});

test('unsubscribe stops further delivery to that handler', async () => {
  const bus = new EventBus();
  let count = 0;
  const unsubscribe = bus.subscribe('tick', () => {
    count += 1;
  });

  await bus.publish({ eventName: 'tick', sourceEngine: 'test', payload: null });
  unsubscribe();
  await bus.publish({ eventName: 'tick', sourceEngine: 'test', payload: null });

  assert.equal(count, 1);
});

test('publish rejects an empty eventName or sourceEngine', async () => {
  const bus = new EventBus();
  await assert.rejects(() => bus.publish({ eventName: '', sourceEngine: 'test', payload: null }), /eventName/);
  await assert.rejects(() => bus.publish({ eventName: 'ok', sourceEngine: '', payload: null }), /sourceEngine/);
});

test('getDiagnostics reflects publish counts, active subscriptions, and recent events', async () => {
  const bus = new EventBus();
  bus.subscribe('tracked', () => {});

  await bus.publish({ eventName: 'tracked', sourceEngine: 'test', payload: null });
  await bus.publish({ eventName: 'tracked', sourceEngine: 'test', payload: null });

  const diagnostics = bus.getDiagnostics();
  assert.equal(diagnostics.totalPublished, 2);
  assert.equal(diagnostics.totalSubscriptions, 1);
  assert.equal(diagnostics.recentEvents.length, 2);
  assert.equal(diagnostics.recentEvents[0].eventName, 'tracked');
  assert.equal(diagnostics.recentEvents[0].status, 'delivered');
  assert.ok(diagnostics.recentEvents[0].correlationId);
});

test('listSubscriptions exposes registered subscriptions without leaking handlers', () => {
  const bus = new EventBus();
  bus.subscribe('a', () => {}, { sourceEngine: 'bills' });
  bus.subscribe('b', () => {});

  const subscriptions = bus.listSubscriptions();
  assert.equal(subscriptions.length, 2);
  assert.deepEqual(
    subscriptions.map((subscription) => subscription.eventName).sort(),
    ['a', 'b']
  );
  assert.equal(subscriptions.find((subscription) => subscription.eventName === 'a')?.filter?.sourceEngine, 'bills');
});

test('clearForTests resets subscriptions, log, and counters', async () => {
  const bus = new EventBus();
  bus.subscribe('x', () => {});
  await bus.publish({ eventName: 'x', sourceEngine: 'test', payload: null });

  bus.clearForTests();

  const diagnostics = bus.getDiagnostics();
  assert.equal(diagnostics.totalPublished, 0);
  assert.equal(diagnostics.totalSubscriptions, 0);
  assert.deepEqual(diagnostics.recentEvents, []);
});
