import 'server-only';
import type { ProductEdition } from '../types/edition';

// TODO(product-edition): organizations.edition exists in the schema
// (migration 0015) but isn't selected by getSessionContext yet -- that
// migration hasn't been applied to production in this session (no
// Supabase MCP tool available). Once it's applied, read the edition
// from session.organization.edition here instead of returning a
// constant. Selecting a not-yet-existing column would break session
// loading for every workspace page, so this is deliberately not wired
// until then.
export async function getCurrentEdition(): Promise<ProductEdition> {
  return 'finance_suite';
}
