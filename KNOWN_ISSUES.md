# Known Issues

## Migration 0028

Status:
Known repository inconsistency.

Current Decision:
- Leave untouched.
- No reverse engineering.
- No database modifications.
- No replacement migration.

Reason:
The database contains a valid migration which is currently not represented in Git. Nothing in the application currently depends on it.

Future Action:
Recover the original migration only if a future approved milestone requires it.

---------------------------------------------------------

## Repository Health

Current branch synchronized.

Working tree clean.

Typecheck passing.

Lint passing.

Tests passing.

Production build passing.

Preview deployment healthy.

---------------------------------------------------------

## Pending Validation: Commercial Administration

Status:
Built and automatically validated (typecheck, lint, tests, build, unauthenticated/non-admin permission checks). Not yet exercised end-to-end by a real Platform Admin.

Reason:
No platform-admin Supabase credentials were available in the implementing session, so the authenticated create/update flows below were not clicked through in a live browser.

Future Action:
Validate Commercial Administration using a real Platform Admin account. That validation should confirm:
- Create Promotion
- Activate Promotion
- Deactivate Promotion
- Generate Coupon
- Enable Coupon
- Disable Coupon
- Update Commercial Settings
- Verify Subscription payment links reflect updated UPI, WhatsApp, and Payee values from commercial_settings

---------------------------------------------------------

## Development Process

Every future milestone must follow this workflow:

1. Planning
2. User Approval
3. Implementation
4. Validation
5. Checkpoint Report
6. Stop

No milestone may proceed without explicit approval.
