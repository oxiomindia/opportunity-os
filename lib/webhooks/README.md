# Webhook Engine

Delivers platform events to external HTTP endpoints. Built entirely on top
of the existing Engine Framework, Event Bus, and the registry conventions
URP established -- none of those three are modified by this milestone.

## Why this exists

The Event Bus (`lib/events/bus.ts`) is in-process only: `eventBus.subscribe`
reaches other code running in the same Node process, never an external
system. The Webhook Engine is the platform's first outbound bridge from
that internal bus to the outside world -- so a customer's own system (or
Zapier, or an internal ops tool) can react to `engine.health-checked`,
`report.generated`, or any future event without polling.

## Required flow

```
Engine -> Event Bus -> Webhook Engine -> External Endpoint
```

`lib/webhooks/dispatcher.ts` subscribes to the Event Bus's `'*'` wildcard
once, at bootstrap. Every engine (and URP, and anything else that ever
calls `eventBus.publish`) reaches a subscribed webhook endpoint
automatically. **Nothing outside `lib/webhooks/` imports anything from
it** -- "must not require engines to know anything about webhooks" is true
structurally, not just by convention: delete `lib/webhooks/` entirely and
every engine, the Event Bus, and URP keep working exactly as before.

## The webhook model

`WebhookEndpoint` (`lib/webhooks/types.ts`):

| Field | Notes |
|---|---|
| Webhook ID | generated (`crypto.randomUUID()`) on registration |
| Endpoint | the destination URL |
| Secret | HMAC signing key; never returned by any read API (`WebhookEndpointSummary` omits it) |
| Status | `'active' \| 'paused' \| 'disabled'` -- only `'active'` receives deliveries |
| Version | endpoint schema version |
| Event Filters | event names, or `'*'` -- same wildcard convention `EventBus.subscribe` already uses |
| Retry Policy | `{ maxAttempts, initialDelayMs, maxDelayMs }`, defaulted, overridable per endpoint |
| Created / Updated | ISO timestamps |
| Secret Status | `{ version, rotatedAt }` -- what the Admin Console shows instead of the secret itself |

## Engine capabilities

- **Endpoint Registry** (`lib/webhooks/registry.ts`) -- register / list /
  get / updateStatus / rotateSecret. Mirrors `lib/engine/registry.ts` and
  `lib/urp/registry.ts`'s self-registration convention as closely as it
  can; the difference is that webhook endpoints are runtime *data*, not
  code, so this is a CRUD store rather than an import-triggered
  self-registration list.
- **Subscription Registry** (`lib/webhooks/subscriptions.ts`) --
  `findSubscribedEndpoints(event)`, derived from each endpoint's own
  `eventFilters` rather than tracked as a separate list, so the two can
  never drift apart (the same principle as URP's `supportedFormats`).
- **Event Filtering** -- `matchesFilters`, exact name or `'*'`.
- **HMAC Signing** / **Replay Protection** (`lib/webhooks/signing.ts`) --
  one function, `signPayload`, HMAC-SHA256 over `${timestamp}.${body}`
  (the Stripe/GitHub-style timestamped construction). `verifySignature` is
  the matching reference implementation a receiver would run: constant-time
  compare, and it rejects a signature whose timestamp is outside a
  tolerance window even when the signature itself is valid -- that
  timestamp binding is what makes replay protection possible at all.
  Exercised for real (not mocked) in
  `lib/webhooks/webhooks.integration.test.ts` against a local HTTP server.
- **Secret Rotation** -- `rotateSecret(id)` issues a new secret and bumps
  `secretStatus.version`. No overlap/grace window in this milestone (see
  "what's deliberately not here").
- **Retry Queue** / **Exponential Backoff** / **Dead Letter Queue**
  (`lib/webhooks/backoff.ts`, `lib/webhooks/delivery.ts`) --
  `computeBackoffDelayMs` is the one function that computes a delay
  (doubling per attempt, capped, with full jitter); `delivery.ts` is the
  only caller, for both the first attempt and every retry, so there is
  exactly one retry algorithm in the codebase. An attempt that exhausts
  `retryPolicy.maxAttempts` moves to the Dead Letter Queue
  (`getDeadLetterQueue()`) instead of retrying forever.
- **Idempotency** -- a `(endpointId, eventId)` pair that has already
  started delivering is not dispatched a second time; `deliverEvent`
  returns the existing attempt instead.
- **Delivery History** / **Logging** / **Metrics** / **Diagnostics** --
  `getDeliveryHistory(endpointId?)` (bounded, most-recent-first),
  `computeEndpointMetrics(endpointId)` (success rate, average delivery
  time over successful deliveries, last delivery), and
  `getEndpointDiagnostics(endpointId)` composing endpoint + metrics +
  recent deliveries + pending retries -- what the Admin Console renders.

## Delivery is decoupled from the publisher

`EventBus.publish()` awaits each subscriber handler in turn
(`lib/events/bus.ts`) -- if the Webhook Engine's Event Bus handler awaited
an actual HTTP delivery (with retries), every `eventBus.publish()` call
anywhere on the platform would be as slow as the slowest webhook endpoint.
`dispatcher.ts` instead schedules delivery via Next's `after()` (extending
a serverless invocation's lifetime the same way `waitUntil` does on
Vercel) when called from a real request or prerender, falling back to a
plain detached microtask when there is no request scope (a test, or any
non-request call site -- `after()` throws in that case, so this is a
`try`/`catch`, not a guess). Either way, `handleEvent` returns immediately
and `publish()` is never slowed down by network latency.

## Transport is abstracted

`WebhookDeliveryProvider` (`lib/webhooks/types.ts`) is the only interface
`delivery.ts` depends on for the network call -- never `fetch` directly.
`FetchDeliveryProvider` (`lib/webhooks/provider.ts`) is the real,
production implementation; tests inject a fake for deterministic failure
injection. The integration test uses the *real* `FetchDeliveryProvider`
against a real local HTTP server, proving the actual transport, signing,
and retry code paths together.

## Retry Queue processing

There is no background worker/cron infrastructure in this app.
`processRetryQueue()` is the function a scheduler would call; today,
`app/api/internal/webhooks/process-queue/route.ts` calls it, guarded by
the same `CRON_SECRET`-bearer-token pattern
`app/api/internal/feedback/weekly/route.ts` already established (reused,
not reinvented).

## Admin Console

`app/control-center/webhooks/page.tsx` -- the reserved "Webhook Engine"
placeholder, now implemented read-only: registered endpoints, subscribed
events, delivery status, retry queue, failure count, last delivery,
success rate, average delivery time, secret status. No editing UI in this
milestone -- endpoints can only be registered via `registerEndpoint()`
directly (used today by tests and available to a future admin mutation
UI), not through the Admin Console.

## What's deliberately not here

Per this milestone's explicit scope: no persistence (endpoints, delivery
history, and the retry/dead-letter queues are in-process, like the Engine
Registry and Report Registry before them -- reset on cold start), no
editing UI, no secret rotation grace window/overlap period, no real
background dispatcher process (only the function + the cron-triggered
route above), and no Notification Engine, System Health, Integrations, or
AI Engine -- those are separate, later milestones.
