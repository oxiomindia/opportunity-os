import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDeliveryHeaders, generateWebhookSecret, signPayload, verifySignature } from './signing';

test('signPayload is deterministic for the same secret, timestamp, and body', () => {
  const a = signPayload('secret', 1700000000, '{"a":1}');
  const b = signPayload('secret', 1700000000, '{"a":1}');
  assert.equal(a, b);
});

test('signPayload changes if the secret, timestamp, or body changes', () => {
  const base = signPayload('secret', 1700000000, '{"a":1}');
  assert.notEqual(signPayload('different-secret', 1700000000, '{"a":1}'), base);
  assert.notEqual(signPayload('secret', 1700000001, '{"a":1}'), base);
  assert.notEqual(signPayload('secret', 1700000000, '{"a":2}'), base);
});

test('buildDeliveryHeaders produces a signature verifySignature accepts', () => {
  const body = JSON.stringify({ hello: 'world' });
  const headers = buildDeliveryHeaders({ secret: 'shh', deliveryId: 'd1', eventId: 'e1', eventName: 'test.event', body, timestampSeconds: 1700000000 });

  assert.equal(headers['X-Oxiom-Delivery-Id'], 'd1');
  assert.equal(headers['X-Oxiom-Event-Id'], 'e1');
  assert.equal(headers['X-Oxiom-Event'], 'test.event');
  assert.equal(headers['X-Oxiom-Timestamp'], '1700000000');
  assert.match(headers['X-Oxiom-Signature'], /^t=1700000000,v1=[0-9a-f]{64}$/);

  const result = verifySignature('shh', body, headers['X-Oxiom-Signature'], { nowSeconds: 1700000000 });
  assert.deepEqual(result, { ok: true });
});

test('verifySignature rejects a tampered body', () => {
  const headers = buildDeliveryHeaders({ secret: 'shh', deliveryId: 'd1', eventId: 'e1', eventName: 'x', body: '{"a":1}', timestampSeconds: 1700000000 });
  const result = verifySignature('shh', '{"a":2}', headers['X-Oxiom-Signature'], { nowSeconds: 1700000000 });
  assert.equal(result.ok, false);
});

test('verifySignature rejects the wrong secret', () => {
  const headers = buildDeliveryHeaders({ secret: 'shh', deliveryId: 'd1', eventId: 'e1', eventName: 'x', body: '{"a":1}', timestampSeconds: 1700000000 });
  const result = verifySignature('wrong-secret', '{"a":1}', headers['X-Oxiom-Signature'], { nowSeconds: 1700000000 });
  assert.equal(result.ok, false);
});

test('verifySignature rejects a missing or malformed header', () => {
  assert.equal(verifySignature('shh', '{}', null).ok, false);
  assert.equal(verifySignature('shh', '{}', undefined).ok, false);
  assert.equal(verifySignature('shh', '{}', 'not-a-real-signature').ok, false);
});

test('verifySignature enforces the replay-protection tolerance window even with a valid signature', () => {
  const headers = buildDeliveryHeaders({ secret: 'shh', deliveryId: 'd1', eventId: 'e1', eventName: 'x', body: '{}', timestampSeconds: 1700000000 });

  const withinWindow = verifySignature('shh', '{}', headers['X-Oxiom-Signature'], { nowSeconds: 1700000000 + 60, toleranceSeconds: 300 });
  assert.equal(withinWindow.ok, true);

  const outsideWindow = verifySignature('shh', '{}', headers['X-Oxiom-Signature'], { nowSeconds: 1700000000 + 600, toleranceSeconds: 300 });
  assert.equal(outsideWindow.ok, false);
  if (!outsideWindow.ok) assert.match(outsideWindow.reason, /tolerance window/);
});

test('generateWebhookSecret returns distinct, sufficiently long hex secrets', () => {
  const a = generateWebhookSecret();
  const b = generateWebhookSecret();
  assert.notEqual(a, b);
  assert.match(a, /^[0-9a-f]{64}$/);
});
