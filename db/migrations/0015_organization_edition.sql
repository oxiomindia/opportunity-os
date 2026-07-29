-- Product Edition layer: one codebase, one database, three licensable
-- products (AP-only, AR-only, Finance Suite). Adds the single column
-- this needs -- no table duplication, no schema branching. Defaults
-- every organization (existing and new) to finance_suite so this is
-- purely additive: nothing currently visible becomes hidden until an
-- organization is deliberately assigned a narrower edition.
ALTER TABLE organizations ADD COLUMN "edition" text NOT NULL DEFAULT 'finance_suite';
ALTER TABLE organizations ADD CONSTRAINT "organizations_edition_check" CHECK ("edition" IN ('ap', 'ar', 'finance_suite'));
