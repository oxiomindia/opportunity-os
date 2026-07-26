import {
  bigint,
  boolean,
  date,
  index,
  integer,
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
export const invoiceStatus = pgEnum('invoice_status', ['received', 'processing', 'needs-review', 'verified', 'accounts-review', 'approved', 'rejected', 'payment-ready', 'paid', 'archived']);
export const attachmentStatus = pgEnum('attachment_status', ['pending', 'stored', 'processing', 'ready', 'failed', 'quarantined']);
export const auditAction = pgEnum('audit_action', ['create', 'update', 'status-change', 'archive', 'restore', 'delete', 'upload', 'extract']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
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

export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  email: text('email'),
  taxIdentifier: text('tax_identifier'),
  ...timestamps,
}, (table) => [
  uniqueIndex('vendors_org_normalized_name_uidx').on(table.organizationId, table.normalizedName),
  index('vendors_org_idx').on(table.organizationId),
]);

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
  invoiceNumber: text('invoice_number'),
  invoiceDate: date('invoice_date'),
  dueDate: date('due_date'),
  currency: text('currency').notNull().default('USD'),
  subtotal: numeric('subtotal', { precision: 18, scale: 2 }),
  taxTotal: numeric('tax_total', { precision: 18, scale: 2 }),
  total: numeric('total', { precision: 18, scale: 2 }),
  status: invoiceStatus('status').notNull().default('received'),
  extractionConfidence: numeric('extraction_confidence', { precision: 5, scale: 2 }),
  source: text('source').notNull().default('manual-upload'),
  assignedTo: uuid('assigned_to').references(() => profiles.id, { onDelete: 'set null' }),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  version: integer('version').notNull().default(1),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  ...timestamps,
}, (table) => [
  index('invoices_org_status_created_idx').on(table.organizationId, table.status, table.createdAt),
  index('invoices_org_vendor_idx').on(table.organizationId, table.vendorId),
  index('invoices_org_due_date_idx').on(table.organizationId, table.dueDate),
  uniqueIndex('invoices_org_vendor_number_uidx').on(table.organizationId, table.vendorId, table.invoiceNumber),
]);

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
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
