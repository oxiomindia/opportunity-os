/**
 * The one place in the codebase that enumerates engine modules by name.
 * Its only job is triggering each module's top-level self-registration
 * (see lib/engine/registry.ts) -- it does not construct engines, does not
 * hold engine state, and does not know anything about a given engine's
 * metadata or behavior. A future engine adds one import line here; nothing
 * else in the framework changes.
 *
 * Import this module (for its side effects) before calling listEngines()/
 * getEngine() -- see app/control-center/engine-registry/page.tsx.
 */
import '../itcRecovery/engine';
import '../vendorInvoices/engine';
import '../control-center/engine';
import '../growth/engine';
