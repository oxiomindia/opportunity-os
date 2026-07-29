import {
  bigint,
  boolean,
  date,
  index,
  integer,
  smallint,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const memberRole = pgEnum('member_role', ['owner', 'admin', 'reviewer', 'member', 'viewer']);
export const invoiceStatus = pgEnum('invoice_status', ['draft', 'sent', 'viewed', 'partially-paid', 'paid', 'overdue', 'void']);
export const attachmentStatus = pgEnum('attachment_status', ['pending', 'stored', 'processing', 'ready', 'failed', 'quarantined']);
export const vendorInvoiceStatus = pgEnum('vendor_invoice_status', ['draft', 'pending-approval', 'approved', 'payment-scheduled', 'partially-paid', 'paid', 'void']);
export const auditAction = pgEnum('audit_action', ['create', 'update', 'status-change', 'archive', 'restore', 'delete', 'upload', 'extract']);
export const feedbackStatus = pgEnum('feedback_status', ['new','under-review','more-information-needed','planned','in-progress','resolved','declined','duplicate']);
export const feedbackPriority = pgEnum('feedback_priority', ['unassigned','low','medium','high','critical']);
export const platformAdminRole = pgEnum('platform_admin_role', ['product-admin','security-admin','platform-admin']);
export const feedbackRunStatus = pgEnum('feedback_run_status', ['running','completed','failed']);
export const commercialTrialStatus = pgEnum('commercial_trial_status', ['none','active','expired','converted']);
export const commercialSubscriptionStatus = pgEnum('commercial_subscription_status', ['none','trialing','active','past_due','canceled']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  edition: text('edition').notNull().default('finance_suite'),
  invoiceNumberCounter: integer('invoice_number_counter').notNull().default(0),
  ...timestamps,
}, (table) => [uniqueIndex('organizations_slug_uidx').on(table.slug)]);

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users(id); managed in the database migration.
  displayName: text('display_name').notNull(),
  email: text('email').notNull(),
  ...timestamps,
}, (table) => [uniqueIndex('profiles_email_uidx').on(table.email)]);

export const organizationMembers = pgTable('organization_members', {
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: memberRole('role').notNull().default('member'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('organization_members_org_user_uidx').on(table.organizationId, table.userId),
  index('organization_members_user_idx').on(table.userId),
]);

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  billingAddress: text('billing_address'),
  taxIdentifier: text('tax_identifier'),
  ...timestamps,
}, (table) => [
  uniqueIndex('customers_org_normalized_name_uidx').on(table.organizationId, table.normalizedName),
  index('customers_org_idx').on(table.organizationId),
]);

export const productsServices = pgTable('products_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  sku: text('sku'),
  unitPrice: numeric('unit_price', { precision: 18, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  active: boolean('active').notNull().default(true),
  ...timestamps,
}, (table) => [
  index('products_services_org_idx').on(table.organizationId),
  uniqueIndex('products_services_org_sku_uidx').on(table.organizationId, table.sku),
]);

export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxIdentifier: text('tax_identifier'),
  ...timestamps,
}, (table) => [
  uniqueIndex('vendors_org_normalized_name_uidx').on(table.organizationId, table.normalizedName),
  index('vendors_org_idx').on(table.organizationId),
]);

export const vendorInvoices = pgTable('vendor_invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  vendorId: uuid('vendor_id').references(() => vendors.id),
  vendorInvoiceNumber: text('vendor_invoice_number'),
  invoiceDate: date('invoice_date'),
  dueDate: date('due_date'),
  currency: text('currency').notNull().default('USD'),
  subtotal: numeric('subtotal', { precision: 18, scale: 2 }),
  taxTotal: numeric('tax_total', { precision: 18, scale: 2 }),
  total: numeric('total', { precision: 18, scale: 2 }),
  status: vendorInvoiceStatus('status').notNull().default('draft'),
  notes: text('notes'),
  paymentScheduledDate: date('payment_scheduled_date'),
  paymentReference: text('payment_reference'),
  version: integer('version').notNull().default(1),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index('vendor_invoices_org_idx').on(table.organizationId),
  index('vendor_invoices_org_vendor_idx').on(table.organizationId, table.vendorId),
  uniqueIndex('vendor_invoices_org_vendor_number_uidx').on(table.organizationId, table.vendorId, table.vendorInvoiceNumber),
]);

export const vendorInvoiceItems = pgTable('vendor_invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  vendorInvoiceId: uuid('vendor_invoice_id').notNull().references(() => vendorInvoices.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 18, scale: 4 }),
  unitPrice: numeric('unit_price', { precision: 18, scale: 4 }),
  lineTotal: numeric('line_total', { precision: 18, scale: 2 }).notNull(),
}, (table) => [index('vendor_invoice_items_invoice_idx').on(table.vendorInvoiceId)]);

export const vendorInvoiceStatusHistory = pgTable('vendor_invoice_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  vendorInvoiceId: uuid('vendor_invoice_id').notNull().references(() => vendorInvoices.id, { onDelete: 'cascade' }),
  fromStatus: vendorInvoiceStatus('from_status'),
  toStatus: vendorInvoiceStatus('to_status').notNull(),
  reason: text('reason'),
  changedBy: uuid('changed_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('vendor_invoice_status_history_invoice_idx').on(table.vendorInvoiceId)]);

export const vendorInvoiceAttachments = pgTable('vendor_invoice_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  vendorInvoiceId: uuid('vendor_invoice_id').notNull().references(() => vendorInvoices.id, { onDelete: 'cascade' }),
  storageKey: text('storage_key').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  sha256: text('sha256').notNull(),
  pageCount: integer('page_count'),
  status: attachmentStatus('status').notNull().default('stored'),
  errorMessage: text('error_message'),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('vendor_invoice_attachments_storage_key_uidx').on(table.storageKey),
  index('vendor_invoice_attachments_invoice_idx').on(table.vendorInvoiceId),
]);

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id),
  invoiceNumber: text('invoice_number'),
  invoiceDate: date('invoice_date'),
  dueDate: date('due_date'),
  currency: text('currency').notNull().default('USD'),
  subtotal: numeric('subtotal', { precision: 18, scale: 2 }),
  taxTotal: numeric('tax_total', { precision: 18, scale: 2 }),
  total: numeric('total', { precision: 18, scale: 2 }),
  status: invoiceStatus('status').notNull().default('draft'),
  assignedTo: uuid('assigned_to').references(() => profiles.id, { onDelete: 'set null' }),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  version: integer('version').notNull().default(1),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  ...timestamps,
}, (table) => [
  index('invoices_org_status_created_idx').on(table.organizationId, table.status, table.createdAt),
  index('invoices_org_vendor_idx').on(table.organizationId, table.vendorId),
  index('invoices_org_customer_idx').on(table.organizationId, table.customerId),
  index('invoices_org_due_date_idx').on(table.organizationId, table.dueDate),
  uniqueIndex('invoices_org_vendor_number_uidx').on(table.organizationId, table.vendorId, table.invoiceNumber),
  uniqueIndex('invoices_org_number_uidx').on(table.organizationId, table.invoiceNumber),
]);

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => productsServices.id),
  position: integer('position').notNull(),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 18, scale: 4 }),
  unitPrice: numeric('unit_price', { precision: 18, scale: 4 }),
  taxAmount: numeric('tax_amount', { precision: 18, scale: 2 }),
  lineTotal: numeric('line_total', { precision: 18, scale: 2 }).notNull(),
}, (table) => [uniqueIndex('invoice_items_invoice_position_uidx').on(table.invoiceId, table.position), index('invoice_items_org_idx').on(table.organizationId)]);

export const invoiceTaxes = pgTable('invoice_taxes', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  rate: numeric('rate', { precision: 9, scale: 4 }),
  taxableAmount: numeric('taxable_amount', { precision: 18, scale: 2 }),
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
}, (table) => [index('invoice_taxes_invoice_idx').on(table.invoiceId), index('invoice_taxes_org_idx').on(table.organizationId)]);

export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  storageKey: text('storage_key').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  sha256: text('sha256').notNull(),
  pageCount: integer('page_count'),
  status: attachmentStatus('status').notNull().default('pending'),
  errorMessage: text('error_message'),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('attachments_storage_key_uidx').on(table.storageKey), index('attachments_org_invoice_idx').on(table.organizationId, table.invoiceId)]);

export const statusHistory = pgTable('invoice_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  fromStatus: invoiceStatus('from_status'),
  toStatus: invoiceStatus('to_status').notNull(),
  reason: text('reason'),
  changedBy: uuid('changed_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('status_history_org_invoice_created_idx').on(table.organizationId, table.invoiceId, table.createdAt)]);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  actorId: uuid('actor_id').references(() => profiles.id, { onDelete: 'set null' }),
  invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  action: auditAction('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  changes: jsonb('changes').$type<Record<string, unknown>>(),
  requestId: text('request_id'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('audit_logs_org_created_idx').on(table.organizationId, table.createdAt), index('audit_logs_invoice_idx').on(table.invoiceId)]);

export const platformAdmins = pgTable('platform_admins', { userId: uuid('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }), role: platformAdminRole('role').notNull(), active: boolean('active').notNull().default(true), createdAt: timestamp('created_at',{withTimezone:true}).notNull().defaultNow() });
export const feedbackSubmissions = pgTable('feedback_submissions', {
  id: uuid('id').primaryKey().defaultRandom(), organizationId: uuid('organization_id').notNull().references(()=>organizations.id), pros:text('pros'), cons:text('cons'), category:text('category').notNull(), featureArea:text('feature_area'), sourceRoute:text('source_route'), rating:smallint('rating'), mayContact:boolean('may_contact').notNull().default(false), anonymousToProductTeam:boolean('anonymous_to_product_team').notNull().default(false), status:feedbackStatus('status').notNull().default('new'), humanPriority:feedbackPriority('human_priority').notNull().default('unassigned'), engineSuggestedPriority:feedbackPriority('engine_suggested_priority').notNull().default('unassigned'), priorityConfirmedBy:uuid('priority_confirmed_by').references(()=>profiles.id), urgentReview:boolean('urgent_review').notNull().default(false), urgencyReason:text('urgency_reason'), productVersion:text('product_version'), userAgentSummary:text('user_agent_summary'), idempotencyKey:uuid('idempotency_key').notNull(), contentHash:text('content_hash').notNull(), submittedAt:timestamp('submitted_at',{withTimezone:true}).notNull().defaultNow(), updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(), assignedAdminUserId:uuid('assigned_admin_user_id').references(()=>profiles.id), softDeletedAt:timestamp('soft_deleted_at',{withTimezone:true}),
}, table=>[uniqueIndex('feedback_submissions_user_idempotency_idx').on(table.organizationId,table.idempotencyKey),index('feedback_submissions_org_submitted_idx').on(table.organizationId,table.submittedAt)]);
export const feedbackSourceIdentities=pgTable('feedback_source_identities',{feedbackId:uuid('feedback_id').primaryKey().references(()=>feedbackSubmissions.id),organizationId:uuid('organization_id').notNull().references(()=>organizations.id),userId:uuid('user_id').notNull().references(()=>profiles.id),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()});
export const feedbackStatusHistory=pgTable('feedback_status_history',{id:uuid('id').primaryKey().defaultRandom(),feedbackId:uuid('feedback_id').notNull().references(()=>feedbackSubmissions.id),previousStatus:feedbackStatus('previous_status'),newStatus:feedbackStatus('new_status').notNull(),changedBy:uuid('changed_by').notNull().references(()=>profiles.id),changeReason:text('change_reason'),changedAt:timestamp('changed_at',{withTimezone:true}).notNull().defaultNow()},table=>[index('feedback_status_history_feedback_idx').on(table.feedbackId,table.changedAt)]);
export const feedbackAdminNotes=pgTable('feedback_admin_notes',{id:uuid('id').primaryKey().defaultRandom(),feedbackId:uuid('feedback_id').notNull().references(()=>feedbackSubmissions.id),authorId:uuid('author_id').notNull().references(()=>profiles.id),note:text('note').notNull(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow()});
export const feedbackWeeklyReports=pgTable('feedback_weekly_reports',{id:uuid('id').primaryKey().defaultRandom(),periodStart:timestamp('period_start',{withTimezone:true}).notNull(),periodEnd:timestamp('period_end',{withTimezone:true}).notNull(),reportVersion:integer('report_version').notNull().default(1),generatedSummary:text('generated_summary').notNull(),structuredMetrics:jsonb('structured_metrics').notNull(),structuredInsights:jsonb('structured_insights').notNull(),status:text('status').notNull().default('generated'),generatedAt:timestamp('generated_at',{withTimezone:true}).notNull().defaultNow(),reviewedAt:timestamp('reviewed_at',{withTimezone:true}),reviewedBy:uuid('reviewed_by').references(()=>profiles.id)});
export const feedbackEngineRuns=pgTable('feedback_engine_runs',{id:uuid('id').primaryKey().defaultRandom(),periodStart:timestamp('period_start',{withTimezone:true}).notNull(),periodEnd:timestamp('period_end',{withTimezone:true}).notNull(),startedAt:timestamp('started_at',{withTimezone:true}).notNull().defaultNow(),completedAt:timestamp('completed_at',{withTimezone:true}),status:feedbackRunStatus('status').notNull().default('running'),sourceCount:integer('source_count').notNull().default(0),outputReportId:uuid('output_report_id').references(()=>feedbackWeeklyReports.id),provider:text('provider'),model:text('model'),errorDetails:text('error_details'),retryCount:integer('retry_count').notNull().default(0),idempotencyKey:text('idempotency_key').notNull().unique()});
export const feedbackAdminAlerts=pgTable('feedback_admin_alerts',{id:uuid('id').primaryKey().defaultRandom(),feedbackId:uuid('feedback_id').references(()=>feedbackSubmissions.id),reportId:uuid('report_id').references(()=>feedbackWeeklyReports.id),alertType:text('alert_type').notNull(),title:text('title').notNull(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),acknowledgedAt:timestamp('acknowledged_at',{withTimezone:true}),acknowledgedBy:uuid('acknowledged_by').references(()=>profiles.id)});

// Oxiom Control Center — Phase 2a, Checkpoint 2 (Database Foundation).
// Platform-level: Oxiom's own commercial configuration.

// Stable identity anchor for every commercial table to foreign-key against.
// The product's actual name/description/marketing content stays in
// lib/products/catalog.ts — see migration 0018.
export const platformProducts = pgTable('platform_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  ...timestamps,
}, (table) => [uniqueIndex('platform_products_slug_uidx').on(table.slug)]);

export const commercialProductSettings = pgTable('commercial_product_settings', {
  productId: uuid('product_id').primaryKey().references(() => platformProducts.id, { onDelete: 'cascade' }),
  visible: boolean('visible').notNull().default(true),
  statusOverride: text('status_override'),
  badgeLabel: text('badge_label'),
  updatedBy: uuid('updated_by').references(() => profiles.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Commercial Plans sit between Product and Pricing (see migration 0021):
// Product -> Commercial Plan -> Price History. Every product has at least
// a "Standard" plan today; Professional/Enterprise/partner/legacy plans are
// additional rows, not a schema change. Customers subscribe to a Plan (see
// organizationCommercialProfile.currentPlanId below), not a Product.
export const commercialPlans = pgTable('commercial_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => platformProducts.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'),
  ...timestamps,
}, (table) => [uniqueIndex('commercial_plans_product_code_uidx').on(table.productId, table.code)]);

// Pricing is a distinct commercial model from plan configuration, and is
// purely effective-dated (no "active" flag — see migration 0019): the
// current price for a (plan, region) is always the row with the latest
// effectiveFrom that is <= now(). Rows are never updated after insert, so
// historical pricing a customer subscribed under is preserved.
export const commercialProductPricing = pgTable('commercial_product_pricing', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => commercialPlans.id, { onDelete: 'cascade' }),
  region: text('region').notNull().default('global'),
  monthlyPricePaise: integer('monthly_price_paise'),
  annualPricePaise: integer('annual_price_paise'),
  currency: text('currency').notNull().default('INR'),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('commercial_product_pricing_lookup_idx').on(table.planId, table.region, table.effectiveFrom)]);

export const commercialPromotions = pgTable('commercial_promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  headline: text('headline').notNull(),
  description: text('description'),
  discountPercent: smallint('discount_percent'),
  active: boolean('active').notNull().default(false),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => profiles.id),
  ...timestamps,
});

export const commercialAuditLogs = pgTable('commercial_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorUserId: uuid('actor_user_id').references(() => profiles.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  beforeState: jsonb('before_state'),
  afterState: jsonb('after_state'),
  reason: text('reason'),
  requestId: text('request_id'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('commercial_audit_logs_entity_idx').on(table.entityType, table.entityId, table.occurredAt),
  index('commercial_audit_logs_occurred_idx').on(table.occurredAt),
]);

// Organization-level: belongs to individual customer organizations, but
// only the Owner (platform-admin) can read/write it — see migration 0017.
export const organizationCommercialProfile = pgTable('organization_commercial_profile', {
  organizationId: uuid('organization_id').primaryKey().references(() => organizations.id, { onDelete: 'cascade' }),
  gstNumber: text('gst_number'),
  contactPerson: text('contact_person'),
  contactMobile: text('contact_mobile'),
  city: text('city'),
  country: text('country'),
  trialStatus: commercialTrialStatus('trial_status').notNull().default('none'),
  trialStartedAt: timestamp('trial_started_at', { withTimezone: true }),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  subscriptionStatus: commercialSubscriptionStatus('subscription_status').notNull().default('none'),
  currentPlanId: uuid('current_plan_id').references(() => commercialPlans.id, { onDelete: 'set null' }),
  renewalDate: date('renewal_date'),
  updatedBy: uuid('updated_by').references(() => profiles.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('organization_commercial_profile_trial_idx').on(table.trialStatus),
  index('organization_commercial_profile_subscription_idx').on(table.subscriptionStatus),
]);

export const customerNotes = pgTable('customer_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  note: text('note').notNull(),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('customer_notes_org_idx').on(table.organizationId, table.createdAt)]);

export const customerTimelineEvents = pgTable('customer_timeline_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  eventSummary: text('event_summary').notNull(),
  metadata: jsonb('metadata'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  recordedBy: uuid('recorded_by').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('customer_timeline_events_org_idx').on(table.organizationId, table.occurredAt)]);
