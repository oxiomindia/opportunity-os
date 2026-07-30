# Platform Engine Framework

Shared contract every platform capability (Bills, ITC Recovery, Commercial
Administration, and every future engine -- Analytics, Notifications, AI, and
whatever URP/the Webhook Engine end up needing) implements. This framework
defines the contract only; it does not implement reporting, webhooks, or an
event bus -- see the platform architecture review for why those come later
and what they'll build on top of this.

## Why this exists

The Platform Architecture Foundation's architecture review found real,
working precedents for parts of this contract already in the codebase
(`NotificationSource` in
`lib/control-center/notifications.ts`, the run-tracking in
`lib/feedback/engine.ts`) but no shared, reusable definition of "what is an
engine." This framework is that definition, deliberately modeled on those
existing patterns rather than invented from nothing.

## The contract

Every engine is a class extending `BaseEngine` (`lib/engine/base.ts`) and
exposing:

| Concept | Where it lives |
|---|---|
| Engine ID, Name, Description, Version | `metadata` (an `EngineMetadata`) |
| Dependencies, Capabilities, Inputs, Outputs, Supported Events | also on `metadata` |
| Status | `getStatus(): EngineStatus` |
| Health | `getHealth(): EngineHealth` |
| Configuration | `getConfiguration(): EngineConfiguration` |
| Configuration Validation | `validateConfiguration(config): EngineResult<true>` |
| Capability Discovery | `discoverCapabilities(): string[]` |
| Metrics | `getMetrics(): EngineMetrics` |
| Diagnostics | `getDiagnostics(): Promise<EngineDiagnostics>` (composes health + configuration + metrics) |
| Lifecycle: Initialize / Start / Stop / Restart | `initialize()` / `start()` / `stop()` / `restart()` |

All types are in `lib/engine/types.ts`. `BaseEngine` provides real,
honest default implementations for everything that doesn't yet have
something real to report (see the inline comments in `base.ts`) --
overriding a default is a deliberate choice, not something every engine
must do.

**A note on lifecycle:** `initialize`/`start`/`stop`/`restart` default to
no-ops. Every engine registered so far is stateless request-scoped code
running in a serverless function, not a long-running process -- there is
nothing to start or stop. The methods exist on the contract because a
future engine (e.g. one that opens a persistent connection) might need
them; nothing here pretends today's engines need them too.

## Registering an engine (self-registration)

An engine registers itself when its module is imported -- there is no
central list of engines to edit inside the framework itself:

```ts
// lib/yourDomain/engine.ts
import { BaseEngine } from '../engine/base';
import { registerEngine } from '../engine/registry';
import type { EngineHealth, EngineMetadata, EngineStatus } from '../engine/types';

class YourEngine extends BaseEngine {
  readonly metadata: EngineMetadata = {
    id: 'your-domain',
    name: 'Your Domain',
    description: '...',
    version: '1.0.0',
    dependencies: [],
    capabilities: [],
    inputs: [],
    outputs: [],
    supportedEvents: [],
  };
  getStatus(): EngineStatus { return 'active'; }
  getHealth(): EngineHealth { return { status: 'healthy', checkedAt: new Date().toISOString() }; }
}

export const yourEngine = new YourEngine();
registerEngine(yourEngine);
```

Then add exactly one line to `lib/engine/bootstrap.ts`:

```ts
import '../yourDomain/engine';
```

That import is the *only* enumeration of engine modules anywhere in the
framework -- it exists because a bundler-based system needs something to
import a module before its top-level `registerEngine(...)` call can run.
`lib/engine/registry.ts` itself has zero knowledge of which engines exist.

## Reading the registry

```ts
import '../../lib/engine/bootstrap'; // triggers self-registration
import { listEngines } from '../../lib/engine/registry';

const engines = listEngines(); // BaseEngine[]
```

See `app/control-center/engine-registry/page.tsx` for the read-only Admin
Console view (Registered Engines / Version / Status / Health /
Capabilities / Configuration -- no management actions in this milestone).

## What's deliberately not here

Per this milestone's explicit scope: no Universal Report Platform, no
Webhook Engine, no Event Bus, no database-backed registry persistence, no
management actions (enable/disable/restart) in the Admin Console. The
roadmap in the platform architecture review explains the intended build
order and why.
