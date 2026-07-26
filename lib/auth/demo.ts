import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { mockInvoices } from '../../data/mockInvoices';
import { isDemoLoginEnabled } from '../supabase/config';

const DEMO_EMAIL = 'admin@demo.oxiom.local';
const DEMO_PASSWORD = 'admin';

export function isDemoCredentials(username: string, password: string) {
  return isDemoLoginEnabled() && username === 'admin' && password === DEMO_PASSWORD;
}

export async function provisionDemoAccount() {
  if (!isDemoLoginEnabled()) throw new Error('Demo authentication is disabled.');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Demo provisioning requires SUPABASE_SERVICE_ROLE_KEY.');
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', DEMO_EMAIL).maybeSingle();
  let userId = existingProfile?.id;
  if (!userId) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: 'Demo Administrator' },
    });
    if (createError) throw createError;
    userId = created.user?.id;
  }
  if (!userId) throw new Error('Unable to provision the demo user.');

  const { error: profileError } = await admin.from('profiles').upsert({ id: userId, display_name: 'Demo Administrator', email: DEMO_EMAIL });
  if (profileError) throw profileError;
  const { data: organization, error: organizationError } = await admin
    .from('organizations').upsert({ name: 'Demo Organization', slug: 'demo-organization' }, { onConflict: 'slug' }).select('id').single();
  if (organizationError) throw organizationError;
  const { error: membershipError } = await admin.from('organization_members').upsert({ organization_id: organization.id, user_id: userId, role: 'owner', active: true }, { onConflict: 'organization_id,user_id' });
  if (membershipError) throw membershipError;

  const { count } = await admin.from('invoices').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id);
  if (count === 0) {
    const invoices = mockInvoices.map((invoice) => ({
      organization_id: organization.id, invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.invoiceDate, due_date: invoice.dueDate, currency: invoice.currency,
      subtotal: invoice.subtotal, tax_total: invoice.tax, total: invoice.total, status: invoice.status,
      extraction_confidence: invoice.confidence, source: invoice.source, created_by: userId,
    }));
    const { error } = await admin.from('invoices').insert(invoices);
    if (error) throw error;
  }
  return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
}
