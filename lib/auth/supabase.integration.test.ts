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

test('organization onboarding repairs a missing profile and assigns Owner atomically', { skip: !enabled }, async (context) => {
  assert.ok(url && anonKey && serviceKey, 'Supabase integration environment is incomplete');
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const suffix = crypto.randomUUID();
  const email = `onboarding-repair-${suffix}@example.invalid`;
  const password = `${crypto.randomUUID()}aA!9`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: 'Onboarding Repair User',
      phone_number: '+14155552671',
      organization_name: 'Bootstrap Organization',
    },
  });
  assert.ifError(createError);
  assert.ok(created.user);
  const userId = created.user.id;
  const createdOrganizationIds: string[] = [];

  context.after(async () => {
    for (const organizationId of createdOrganizationIds) await admin.from('organizations').delete().eq('id', organizationId);
    await admin.auth.admin.deleteUser(userId);
  });

  // Reproduce the production state: Auth identity exists, but profile and
  // membership bootstrap did not complete. Remove any rows a newer trigger made.
  const { data: bootstrapMemberships } = await admin.from('organization_members').select('organization_id').eq('user_id', userId);
  const bootstrapOrganizationIds = (bootstrapMemberships ?? []).map(({ organization_id }) => organization_id);
  for (const organizationId of bootstrapOrganizationIds) await admin.from('organizations').delete().eq('id', organizationId);
  await admin.from('profiles').delete().eq('id', userId);

  const client = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  assert.ifError(signInError);
  const slug = `onboarding-repair-${suffix}`;
  const { data: organizationId, error: onboardingError } = await client.rpc('create_organization', {
    organization_name: 'Repaired Organization',
    organization_slug: slug,
  });
  assert.ifError(onboardingError);
  assert.ok(organizationId);
  createdOrganizationIds.push(organizationId);

  const [{ data: profile }, { data: membership }, { data: audit }] = await Promise.all([
    admin.from('profiles').select('id,email,display_name').eq('id', userId).single(),
    admin.from('organization_members').select('organization_id,user_id,role,active').eq('organization_id', organizationId).eq('user_id', userId).single(),
    admin.from('audit_logs').select('action,entity_type,actor_id').eq('organization_id', organizationId).eq('entity_id', organizationId).single(),
  ]);
  assert.equal(profile?.email, email);
  assert.equal(profile?.display_name, 'Onboarding Repair User');
  assert.deepEqual(membership, { organization_id: organizationId, user_id: userId, role: 'owner', active: true });
  assert.deepEqual(audit, { action: 'create', entity_type: 'organization', actor_id: userId });
});
