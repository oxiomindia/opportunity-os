import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const enabled = process.env.RUN_SUPABASE_INTEGRATION_TESTS === 'true';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

test('Supabase RLS isolates organizations and enforces membership roles', { skip: !enabled }, async (context) => {
  assert.ok(url && anonKey && serviceKey, 'Supabase integration environment is incomplete');
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const suffix = crypto.randomUUID();
  const password = `${crypto.randomUUID()}aA!9`;
  const users: User[] = [];
  const organizationIds: string[] = [];

  async function createUser(label: string) {
    const { data, error } = await admin.auth.admin.createUser({ email: `${label}-${suffix}@example.invalid`, password, email_confirm: true });
    assert.ifError(error);
    assert.ok(data.user);
    users.push(data.user);
    return data.user;
  }

  async function signIn(user: User): Promise<SupabaseClient> {
    const client = createClient(url!, anonKey!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await client.auth.signInWithPassword({ email: user.email!, password });
    assert.ifError(error);
    return client;
  }

  context.after(async () => {
    for (const organizationId of organizationIds) await admin.from('organizations').delete().eq('id', organizationId);
    for (const user of users) await admin.auth.admin.deleteUser(user.id);
  });

  const [userA, userB] = await Promise.all([createUser('tenant-a'), createUser('tenant-b')]);
  const { data: organizations, error: organizationError } = await admin.from('organizations').insert([
    { name: 'Tenant A Integration', slug: `tenant-a-${suffix}` },
    { name: 'Tenant B Integration', slug: `tenant-b-${suffix}` },
  ]).select('id');
  assert.ifError(organizationError);
  assert.equal(organizations?.length, 2);
  organizationIds.push(...organizations!.map(({ id }) => id));
  const [organizationA, organizationB] = organizationIds;
  const { error: membershipError } = await admin.from('organization_members').insert([
    { organization_id: organizationA, user_id: userA.id, role: 'owner', active: true },
    { organization_id: organizationB, user_id: userB.id, role: 'viewer', active: true },
  ]);
  assert.ifError(membershipError);

  const clientA = await signIn(userA);
  const { data: foreignOrganization, error: readError } = await clientA.from('organizations').select('id').eq('id', organizationB);
  assert.ifError(readError);
  assert.deepEqual(foreignOrganization, []);
  const { data: foreignMembership, error: memberReadError } = await clientA.from('organization_members').select('user_id').eq('organization_id', organizationB);
  assert.ifError(memberReadError);
  assert.deepEqual(foreignMembership, []);

  const { error: crossTenantInsertError } = await clientA.from('invoices').insert({ organization_id: organizationB, created_by: userA.id, currency: 'USD', source: 'manual-upload' });
  assert.ok(crossTenantInsertError, 'cross-tenant invoice insertion must be rejected');
  const { data: crossTenantUpdate, error: crossTenantUpdateError } = await clientA.from('organizations').update({ name: 'Compromised' }).eq('id', organizationB).select('id');
  assert.ok(crossTenantUpdateError || crossTenantUpdate?.length === 0, 'cross-tenant organization update must affect no rows');

  const clientB = await signIn(userB);
  const { data: roleEscalation, error: roleEscalationError } = await clientB.from('organization_members').update({ role: 'owner' }).eq('organization_id', organizationB).eq('user_id', userB.id).select('role');
  assert.ok(roleEscalationError || roleEscalation?.length === 0, 'a viewer must not promote their own membership');
  const { data: unchangedMembership } = await admin.from('organization_members').select('role').eq('organization_id', organizationB).eq('user_id', userB.id).single();
  assert.equal(unchangedMembership?.role, 'viewer');
});
