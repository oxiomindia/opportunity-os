import 'server-only';
import type { ProductEdition } from '../types/edition';
import { getSessionContext } from './auth/dal';

/**
 * Reads the current organization's licensed edition. Backed by
 * organizations.edition (migration 0015, live in production). Only ever
 * called from within the authenticated (workspace) route group, where
 * getSessionContext() is guaranteed non-null by the layout's
 * requireSessionContext() check -- the 'finance_suite' fallback below is
 * defensive, not expected to be exercised.
 */
export async function getCurrentEdition(): Promise<ProductEdition> {
  const session = await getSessionContext();
  return session?.organization.edition ?? 'finance_suite';
}
