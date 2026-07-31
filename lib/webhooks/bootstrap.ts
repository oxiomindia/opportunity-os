// The single initialization point for the Webhook Engine's Event Bus
// subscription, mirroring lib/engine/bootstrap.ts and lib/urp/bootstrap.ts's
// "one file wires it up, nothing else does" convention. Unlike those two,
// there's no per-endpoint module to import -- endpoints are runtime data,
// not code -- so this file's only job is making sure the dispatcher's
// Event Bus subscription exists.
import { ensureWebhookDispatchSubscribed } from './dispatcher';

ensureWebhookDispatchSubscribed();
