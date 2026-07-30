-- Oxiom Control Center — Phase 2b, Checkpoint 2 (Subscriptions), part 1 of 2.
--
-- Split into its own migration because Postgres will not let a new enum
-- value be used in the same transaction that adds it (error 55P04: "unsafe
-- use of new value ... New enum values must be committed before they can be
-- used"). commercial_subscription_status is the Customer Directory's
-- headline status column; migration 0027 syncs it to 'suspended'/'expired'
-- when a subscription reaches those states, so the new values need to be
-- committed first. Purely additive — existing rows and checks are
-- unaffected.

ALTER TYPE commercial_subscription_status ADD VALUE 'suspended';
ALTER TYPE commercial_subscription_status ADD VALUE 'expired';
