# Oxiom One Functionality Audit

> **Living document:** Update this file in the same pull request whenever a route, workflow, integration, database object, permission, or test changes. Do not upgrade a status without repository evidence and, for production readiness, environment evidence.

# Document Metadata

| Field | Value |
|---|---|
| Document version | **1.3.0** |
| Last updated | **2026-07-27** |
| Last reviewed | **2026-07-27** (repository evidence review; production environment not reviewed) |
| Repository commit | `2b7d0fb` — the audited baseline immediately before this documentation revision |
| Repository branch | `work` |
| Application version | `1.0.0` (`package.json`) |
| Database migration version | `0008_repair_organization_onboarding` (latest repository/journal migration; deployment unverified) |
| Scope | Application code, schema/migrations, public assets, tests, build/deployment configuration |
| Evidence basis | Static repository inspection plus the checks listed in [Audit method](#audit-method-and-status-definitions) |
| Runtime verification | Local lint, unit tests, and production build; no production database or deployment inspection |
| Accountable owners | Engineering (implementation), QA (coverage), Product (priority), Security (controls) |

**Commit-field convention:** because a document cannot contain the hash of the commit that contains itself, “Repository commit” always identifies the application baseline audited by the current document revision. A reviewer must update it to the pre-change `HEAD` (or the release tag) whenever the audit is refreshed.

# Change Log

This is a functional change ledger, not a duplicate of `git log`. It records significant changes visible in repository history. `—` means no GitHub PR number is evidenced by the local merge history; it must not be guessed.

| Date | PR number | Commit | Feature | Summary |
|---|---:|---|---|---|
| 2026-07-27 | TBD | `TBD` | Production readiness remediation | Replaced mock data in reports and core queues, removed dead legacy mock UI, expanded CI/Playwright, and added an evidence-based launch audit. |
| 2026-07-27 | TBD | `TBD` | Engineering governance enhancement | Added architecture traceability, risk/incident/release/lifecycle governance, quality/operations/compliance/AI dashboards, KPIs, and continuous-improvement review. |
| 2026-07-27 | TBD | `TBD` | Living audit reference enhancement | Added metadata, changelog, traceability/dependency matrices, release checklist, roadmap and mandatory update policy. |
| 2026-07-27 | — | `7def399` | Functional audit, signup and bootstrap | Added the initial audit, signup UX/error diagnostics, migration 0007 first-user Owner bootstrap, and signup tests. |
| 2026-07-26 | #23 | `28d01fc` | Supabase authentication build | Merged authentication build consistency and the Supabase SSR dependency. |
| 2026-07-26 | #22 | `0051d4b` | Repository audit workstream | Merged the audited workstream represented by that PR; consult the PR for its exact patch. |
| 2026-07-26 | #20 / #21 | `91d2d07` / `1b3adac` | Repository audit workstreams | Merged parallel repository audit/remediation workstreams. |
| 2026-07-26 | #19 | `9cc8539` | Authentication remediation | Merged sign-in and authentication conflict remediation. |
| 2026-07-26 | #18 | `51afb56` | Secure invoice intake | Replaced simulated intake with the secure invoice workflow (`299331c`). |
| 2026-07-26 | #15 / #16 / #17 | `aa0ab97` / `489c1f7` / `b434ee2` | Platform launch | Merged Oxiom One platform launch workstreams. |
| 2026-07-25 | — | `4039940` | SEO/content platform | Added the enterprise SEO/content route set, FAQ, legal, solutions, and documentation. |
| 2026-07-25 | — | `31f3f14` / `cbe8764` | SEO security | Added canonical metadata and hardened structured-data serialization. |

**Changelog rule:** add one row in the same PR as every significant functional, schema, security, infrastructure, or test-gate change. Backfill the PR number during merge/release administration when it is not knowable on the feature branch.

## Audit method and status definitions

This inventory describes only code present in the repository. “Production Ready” does **not** assert that migrations are deployed, secrets are configured, mail is delivered, or an external service is healthy. Those require environment verification. Marketing copy and documentation claims are not counted as implementations.

| Implementation status | Meaning |
|---|---|
| **Complete** | The repository contains a coherent UI/backend path for the stated scope, validation/error handling, and meaningful automated coverage. |
| **Partially Implemented** | A usable portion exists, but an important path, persistence behavior, control, or test is missing. |
| **Stub** | A page/demo/static representation exists without the promised durable workflow. |
| **Planned** | Mentioned in product copy or implied by navigation/schema, but no executable implementation exists. |
| **Deprecated** | Retained code or database behavior has been superseded and should not be used. |

| Readiness rating | Meaning |
|---|---|
| ✅ **Production Ready** | Implemented and adequately tested in-repository; deployment still needs a smoke check. |
| 🟡 **Beta Ready** | Functional for controlled use, with known gaps or incomplete cross-browser/integration evidence. |
| 🟠 **Development** | Mock-backed, incomplete, or insufficiently tested. |
| 🔴 **Not Implemented** | No functional implementation. |

Priorities express risk/sequence, not product commitments: **Critical**, **High**, **Medium**, **Low**.

# Feature Traceability Matrix

Feature IDs are stable and must not be renumbered. Add a new ID for a new capability; mark removed capabilities Deprecated rather than reusing their IDs. “—” means no implementation or coverage exists.

| Feature ID | Requirement | Implementation files | Database objects | API endpoints / actions | UI pages | Unit tests | Integration tests | Playwright tests | Status |
|---|---|---|---|---|---|---|---|---|---|
| WEB-001 | Public landing and product content | `app/page.tsx`, `app/(workspace)/solutions/**`, `app/components/StructuredData.tsx` | — | — | `/`, `/solutions/**`, `/about`, `/faq`, `/docs/**`, `/legal/**`, `/support`, `/contact` | — | — | — | 🟡 Beta Ready |
| NAV-001 | Authenticated application shell/navigation | `app/(workspace)/layout.tsx`, `app/components/{AppShell,Sidebar,TopBar}.tsx`, `workspaceNavigation.ts` | `organization_members`, `organizations` | `requireSessionContext` | All workspace routes | — | — | Anonymous redirects in `tests/e2e/auth.spec.ts` | 🟠 Development |
| SRCH-001 | Search navigation and tenant records | `app/components/GlobalSearch.tsx`, `lib/globalSearch.ts`, `data/mock*.ts` | — (mock only) | — | Shell overlay | — | — | — | Stub |
| AUTH-001 | Login/logout and session protection | `app/login/**`, `lib/auth/{dal,demo-policy,dev-session}.ts`, `proxy.ts` | Supabase `auth.users`, memberships | Login/logout Server Actions | `/login`, protected routes | `demo-policy.test.ts` | `supabase.integration.test.ts` (conditional/partial) | Login, logout and redirects in `auth.spec.ts` | 🟡 Beta Ready |
| AUTH-002 | Signup with validated identity metadata | `app/signup/**`, `lib/auth/{signup,signup-error}.ts` | `auth.users`, `profiles` | Signup Server Action, Supabase `signUp` | `/signup` | `signup.test.ts`, `signup-error.test.ts` | — | Signup navigation/layout only | 🟠 Development |
| AUTH-003 | Verification and callback onboarding | `app/auth/callback/route.ts`, `app/resend-verification/**` | Auth sessions; `complete_signup_onboarding()` | `GET /auth/callback`, resend action | `/resend-verification` | — | — | — | 🟠 Development |
| AUTH-004 | Password recovery/reset | `app/forgot-password/**`, `app/reset-password/**` | Supabase Auth | Recovery/reset Server Actions | `/forgot-password`, `/reset-password` | — | — | — | 🟠 Development |
| TEN-001 | First user creates organization and Owner membership | `app/onboarding/**`, migrations 0001/0006/0007 | `profiles`, `organizations`, `organization_members`, `audit_logs`; bootstrap trigger/RPCs | Organization action and onboarding RPCs | `/onboarding`; signup/callback flow | — | Conditional RLS test does not validate bootstrap | Conditional organization onboarding only | 🟠 Development |
| TEN-002 | Membership and role authorization | `lib/auth/dal.ts`, `proxy.ts`, migration policies | `organization_members`, member/platform role enums, RLS | DAL guards and privileged RPCs | Role shown in shell; no management page | Demo policy only | Conditional RLS isolation/role test | — | 🟠 Development |
| PROF-001 | View and update user profile | Bootstrap code only | `profiles` | — | — | — | — | — | 🔴 Not Implemented |
| DASH-001 | Tenant invoice operational dashboard | `app/(workspace)/dashboard/page.tsx`, `lib/invoices/repository.ts` | `invoices`, `vendors` | Repository/PostgREST reads | `/dashboard` | — | — | Incidental demo login | 🟠 Development |
| INV-001 | Invoice worklist/filter/detail | `app/(workspace)/invoices/**`, `lib/invoices/repository.ts` | Invoice header/items/taxes/history and vendors | Invoice repository | `/invoices`, `/invoices/[id]` | — | — | — | 🟡 Beta Ready |
| INV-002 | Secure invoice upload | `app/(workspace)/upload/**`, `app/api/invoices/upload/route.ts`, `lib/uploads/**` | `invoices`, `attachments`, `audit_logs`; storage bucket; `create_uploaded_invoice()` | `POST /api/invoices/upload` | `/upload` | `validation.test.ts` | — | — | 🟡 Beta Ready |
| INV-003 | Invoice lifecycle and operational queues | Queue pages, `app/(workspace)/invoices/actions.ts` | `invoices`, `invoice_status_history`, `audit_logs`; `manage_invoice_lifecycle()` | Archive/delete Server Actions | `/verification`, `/reviews`, `/accounts-review`, `/payment-queue`, `/activity` | — | — | — | 🟠 Development |
| RPT-001 | Reports and analytics | `app/(workspace)/reports/page.tsx`, `lib/invoices/repository.ts` | `invoices` | Tenant PostgREST reads | `/reports` | — | — | — | 🟡 Beta Ready |
| SET-001 | Persistent workspace settings | `app/(workspace)/settings/page.tsx` | — | — | `/settings` | — | — | Anonymous redirect only | Stub |
| FDB-001 | Submit product feedback | `app/(workspace)/feedback/**`, `lib/feedback/model.ts` | Feedback submission/identity/history tables; `submit_feedback()` | Feedback Server Action/RPC | `/feedback` | `feedback.test.ts` | — | Conditional feedback tests | 🟡 Beta Ready |
| FDB-002 | Platform feedback administration | `app/admin/feedback/**`, `lib/feedback/admin.ts` | Feedback/admin/report/alert tables and admin RPCs | Feedback admin Server Actions | `/admin/feedback/**` | Partial model tests | — | Conditional admin test | 🟡 Beta Ready |
| AI-001 | Weekly feedback metrics analysis | `lib/feedback/{engine,weekly}.ts`, cron route, `vercel.json` | `feedback_engine_runs`, `feedback_weekly_reports`, alerts/themes | `GET|POST /api/internal/feedback/weekly` | `/admin/feedback/reports` | Weekly/model tests | — | — | 🟠 Development |
| FILE-001 | Private file storage/download | Upload API, invoice repository, migration 0002 | `attachments`, private `invoice-attachments` bucket/policies | Upload API; signed URL repository call | `/upload`, `/invoices/[id]` | Signature/name tests | — | — | 🟠 Development |
| OBS-001 | Logging, audit and monitoring | Selected actions/routes, feedback engine | `audit_logs`, status histories, engine runs | Distributed console/event calls | — | — | — | — | 🟠 Development; monitoring absent |
| QA-001 | Automated unit/integration/E2E release gate | `package.json`, `playwright.config.ts`, `.github/workflows/ci.yml`, `tests/**` | Test-only Supabase dependencies | Test commands | Test reports | 22 active tests at baseline | 1 conditional suite | Chromium-only conditional suite | 🟠 Development |
| OPP-001 | Opportunity management | Legacy mock research components/data only | — | — | — | — | — | — | 🔴 Not Implemented |
| MSG-001 | Messaging | — | — | — | — | — | — | — | 🔴 Not Implemented |
| NOTIF-001 | Notifications | — | — | — | — | — | — | — | 🔴 Not Implemented |

# Dependency Matrix

| Feature ID(s) | Feature dependency | APIs/actions | Database dependency | Authentication/authorization | External services | Required environment variables |
|---|---|---|---|---|---|---|
| WEB-001 | Next rendering, shared SEO content | — | — | Landing is public; content under `(workspace)` currently requires session context | Vercel/host | `NEXT_PUBLIC_APP_URL` is used by canonical/auth URL construction |
| NAV-001, DASH-001 | Active session and tenant context | DAL/PostgREST reads | organizations, memberships, invoices | Supabase user + active membership | Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| SRCH-001, RPT-001 | Mock invoice/activity fixtures | — | — | Workspace shell only; no tenant data dependency yet | — | — |
| AUTH-001 | Supabase SSR or explicitly enabled local demo | Auth Server Actions, `auth.getUser/signIn/signOut` | Auth sessions and memberships | Public entry; protected session after success | Supabase Auth | Supabase public variables; `ENABLE_DEMO_LOGIN` only in development |
| AUTH-002 | Signup schemas/error mapping | Signup action, `auth.signUp` | Auth users + bootstrap objects | Public | Supabase Auth/email | Supabase public variables, `NEXT_PUBLIC_APP_URL` |
| AUTH-003, AUTH-004 | Valid Supabase email/PKCE configuration | Auth callback, resend/recovery/reset actions | Auth sessions, onboarding RPC | Callback establishes recovery/signup session | Supabase Auth/email | Supabase public variables, `NEXT_PUBLIC_APP_URL` |
| TEN-001, TEN-002, PROF-001 | Successful Auth identity and applied migrations | Organization action/RPCs, DAL | profiles, organizations, memberships, audit; RLS/functions/trigger | Authenticated user; Owner assigned during bootstrap | Supabase DB/Auth | Supabase public variables; `DATABASE_URL` for migration tooling |
| INV-001, INV-003 | Active tenant and invoice repository | PostgREST, lifecycle Server Actions/RPC | invoice domain tables, RLS, history/audit | Active member; mutation role gate | Supabase DB | Supabase public variables |
| INV-002, FILE-001 | Tenant, storage bucket, upload RPC | Upload API, Storage API, signed URLs | invoices, attachments, audit, storage policies | Viewer denied upload | Supabase DB/Storage | Supabase public variables |
| FDB-001, FDB-002 | Tenant membership or platform-admin grant | Feedback/admin actions and RPCs | feedback tables/functions/RLS | Member submission; product/security/platform admin review | Supabase DB | Supabase public variables |
| AI-001 | Feedback data and scheduled invocation | Weekly internal endpoint | feedback runs/reports/themes/alerts | Cron bearer; admin reads results | Vercel Cron, Supabase | `FEEDBACK_CRON_SECRET` or `CRON_SECRET`, `FEEDBACK_BUSINESS_TIMEZONE`, Supabase URL/service-role key |
| OBS-001 | Instrumented workflows | Console/events | audit/history/run tables | Actor/session varies | No monitoring provider configured | No monitoring variables defined |
| QA-001 | Built application and optional test tenant | Playwright/server/test clients | Optional live Supabase | Demo or test credentials by suite | GitHub Actions, Playwright, Supabase optional | `E2E_BASE_URL`, `E2E_DEMO_LOGIN`, onboarding/admin test credentials, `RUN_SUPABASE_INTEGRATION_TESTS`, Supabase keys |
| OPP-001, MSG-001, NOTIF-001 | Requirements not implemented | — | — | Undefined | Undefined | Undefined |

# Architecture Traceability Matrix

This matrix extends the feature traceability matrix with implementation-layer and control-level mapping. Feature IDs are canonical across both matrices. An em dash means the repository contains no applicable implementation; it does not mean “not yet audited.” Policy groups name the exact policies where practical and refer to the Database Audit for their definitions.

| Feature ID | Business requirement | UI components | Pages | Server Actions | API routes | Tables | Functions / triggers | RLS policies | Environment / third parties | Test coverage |
|---|---|---|---|---|---|---|---|---|---|---|---|
| WEB-001 | Explain product, legal and solution offerings | `StructuredData`, `SolutionPageTemplate` | `/`, content/solutions/docs/legal routes | — | — | — | — | — | `NEXT_PUBLIC_APP_URL`; Next/Vercel | No automated coverage |
| NAV-001 | Provide tenant-aware application navigation | `AppShell`, `Sidebar`, `TopBar`, `GlobalSearch` | All `(workspace)` pages | — | — | organizations, organization_members | DAL session lookup | `members_read_organizations`, `members_read_memberships` | Supabase public variables; Supabase | Anonymous route redirects only |
| SRCH-001 | Find navigation, invoices and activity | `GlobalSearch` | Shell overlay | — | — | —; mock fixtures only | — | — | — | None |
| AUTH-001 | Authenticate, terminate and protect sessions | `LoginForm`, `TopBar` | `/login`, protected routes | `login`, `logout` | — | Supabase Auth, organization_members | DAL/proxy; no DB trigger | Membership read policies | Supabase variables; `ENABLE_DEMO_LOGIN`; Supabase Auth | Demo unit; conditional login/logout E2E; partial RLS integration |
| AUTH-002 | Register a validated account | `SignupForm` | `/signup` | `signup` | — | auth.users, profiles and bootstrap targets | `bootstrap_new_auth_user`; `on_auth_user_created` | Profile/tenant policies apply after creation | Supabase variables, `NEXT_PUBLIC_APP_URL`; Supabase Auth/email | Signup/error unit; layout-only E2E |
| AUTH-003 | Verify email and establish onboarding session | Recovery-style form | `/resend-verification` | `resendVerification` | `GET /auth/callback` | Auth sessions, profiles/org/member bootstrap targets | `complete_signup_onboarding`; bootstrap trigger may precede callback | Tenant/profile policies after session | Supabase variables, app URL; Supabase Auth/email | None |
| AUTH-004 | Recover and reset a password | `RecoveryForm`, `ResetForm` | `/forgot-password`, `/reset-password` | `requestPasswordReset`, `resetPassword` | Callback handles recovery code | Supabase Auth | — | Supabase-managed Auth controls | Supabase variables, app URL; Supabase Auth/email | None |
| TEN-001 | Bootstrap first organization with Owner | `OnboardingForm` | `/onboarding`; signup/callback | `createOrganization` | Callback participates | profiles, organizations, organization_members, audit_logs | `create_organization`, `complete_signup_onboarding`, `bootstrap_new_auth_user`; `on_auth_user_created` | Profile, organization, membership, audit policies | Supabase variables, `DATABASE_URL`; Supabase | Conditional manual-onboarding E2E; no bootstrap integration |
| TEN-002 | Isolate tenants and enforce member roles | Role display/shell only | Workspace/admin routes | Privileged invoice/feedback actions | Upload and weekly routes have independent gates | organization_members, platform_admins, all tenant tables | `is_platform_admin`, DAL role guards | All tenant and feedback policy groups | Supabase variables; Supabase | Conditional RLS integration; incomplete role matrix |
| PROF-001 | Let a user view/update profile | No editor | — | — | — | profiles | Bootstrap functions create row | `users_read_own_profile`, `users_update_own_profile` | Supabase | Bootstrap/profile UI untested |
| DASH-001 | Summarize tenant invoice operations | KPI/recent-invoice components | `/dashboard` | — | — | invoices, vendors | Repository queries | `tenant_invoices_read`, `tenant_vendors` | Supabase variables; Supabase | Incidental demo E2E only |
| INV-001 | Browse/filter/view tenant invoices | Worklist/filter/table/detail/status components | `/invoices`, `/invoices/[id]` | — | — | invoices, vendors, attachments, items, taxes, history | Repository queries/signed URL | Tenant invoice/vendor/attachment/item/tax/history policies | Supabase variables; Supabase DB/Storage | None |
| INV-002 | Validate and securely upload invoice files | Upload dropzone/queue/row/summary | `/upload` | — | `POST /api/invoices/upload` | invoices, attachments, audit_logs; storage.objects | `create_uploaded_invoice`; no trigger | `tenant_invoices_write`, `tenant_attachments`, tenant storage policies, audit write | Supabase variables; Supabase DB/Storage | File validation unit tests only |
| INV-003 | Transition, archive and delete invoices | Worklist/detail actions and queue UIs | Invoice detail plus verification/review/payment/activity queues | `archiveInvoice`, `deleteInvoice` | — | invoices, invoice_status_history, audit_logs | `manage_invoice_lifecycle` | Invoice update, history and audit policies | Supabase variables; Supabase | None |
| RPT-001 | Report invoice operations | Page-local report cards | `/reports` | — | — | —; mock fixtures only | — | — | — | None |
| SET-001 | Configure workspace | Static settings controls | `/settings` | — | — | — | — | — | — | Redirect coverage only |
| FDB-001 | Submit durable, optionally anonymous feedback | `FeedbackForm` | `/feedback` | `submitFeedback` | — | feedback_submissions, feedback_source_identities | `submit_feedback` RPC | Feedback RPC/policies; admin-read policies | Supabase variables; Supabase | Model unit; conditional E2E |
| FDB-002 | Review and administer feedback | `FeedbackTable`, admin forms | `/admin/feedback/**` | update/note/assign actions | — | platform_admins and all feedback admin tables | `is_platform_admin`, admin feedback RPCs | `platform_admin_self` and `feedback_*_admin_*` | Supabase variables; Supabase | Model unit; conditional admin E2E |
| AI-001 | Generate scheduled feedback metrics | No dedicated AI component; reports UI | `/admin/feedback/reports` | — | `GET|POST /api/internal/feedback/weekly` | engine_runs, weekly_reports, alerts; feedback inputs | Metrics engine; no trigger | Admin report/run/alert policies | Cron/service-role/timezone variables; Vercel Cron/Supabase | Weekly/model unit tests; no endpoint integration |
| FILE-001 | Store and retrieve private invoice documents | Upload UI, source-document link | `/upload`, `/invoices/[id]` | — | Upload endpoint | attachments, storage.objects | Upload RPC; signed URL repository | Tenant attachment/storage policies | Supabase variables; Supabase Storage | Signature/name unit only |
| OBS-001 | Record operational/security evidence | — | — | Select actions emit logs | Select routes emit logs | audit_logs, histories, engine_runs | Workflow RPC audit writes | Tenant audit and admin run/history policies | No monitoring provider/variables | No observability tests |
| QA-001 | Prevent regressions before release | — | HTML report when Playwright runs | — | — | Optional test Supabase | — | RLS exercised conditionally | CI/E2E/test variables; GitHub Actions/Playwright/Supabase | Unit suite active; integration conditional; Chromium E2E not CI-gated |
| OPP-001 | Manage opportunities | Legacy unwired research/results components | — | — | — | — | — | — | — | None; not implemented |
| MSG-001 | Exchange messages | — | — | — | — | — | — | — | — | None; not implemented |
| NOTIF-001 | Deliver notifications | — | — | — | — | — | — | — | — | None; not implemented |

# Executive Functional Inventory

The detailed records below cover the requested 20 attributes. To keep the document maintainable, shared controls are referenced rather than repeated: authenticated workspace routes are guarded by `proxy.ts` and `requireSessionContext`; tenant data is intended to be constrained by migration RLS; form actions use Zod where noted.

## Public site, shell, and navigation

| Feature | Description and status | Frontend / UX | Backend, DB, API | Auth / roles | Validation, errors, logging, audit | Tests | Gaps, debt, recommendation | Priority |
|---|---|---|---|---|---|---|---|---|
| Landing page | Public product landing page. **Complete; 🟡 Beta Ready.** | `app/page.tsx`; responsive marketing sections and structured-data components. | Static server-rendered content; no DB/API. | Public. | No inputs; no explicit error path/logging/audit. | No unit or Playwright coverage. | Add smoke, accessibility, responsive and visual tests; validate all CTA destinations. | Medium |
| Marketing/solution pages | About, FAQ, contact, support, compliance, security, changelog, release notes, legal hub and 20 solution pages. **Complete as content; 🟡 Beta Ready.** | Shared workspace shell unexpectedly wraps these pages, so they require login despite marketing-oriented copy. Solution pages share `SolutionPageTemplate`/`solutionContent`. | Static content and files under `public/`; no contact/support submission backend. | Authenticated because they live under `(workspace)`; no role distinction. | Mostly links/mailto; no operational logging/audit. | None. | Decide public-vs-private intent; move public content outside authenticated layout if public. Check factual claims against implemented product. | High |
| Application shell/navigation | Sidebar, top bar, workspace navigation, global search, invoice intake context. **Partially Implemented; 🟠 Development.** | `AppShell`, `Sidebar`, `TopBar`, `workspaceNavigation`, reusable buttons/inputs/badges/cards. Mobile sidebar behavior exists; active navigation is pathname-based. | Session context supplied by workspace layout. | Any active organization member. | No global error boundary, not-found page, or telemetry. | Anonymous route redirect only. | Add navigation, keyboard, mobile, loading/error-boundary tests; role-filter navigation. | High |
| Global search | Client search palette over invoices/activity/navigation. **Stub; 🟠 Development.** | `GlobalSearch` provides keyboard/search UI. | `lib/globalSearch.ts` searches `mockInvoices` and `mockActivityEvents`; no DB query/API. | Workspace authentication only; results are not tenant-derived. | Basic string normalization; no operational errors/log/audit. | None. | Replace mocks with tenant-scoped server search, debounce/pagination, authorization and tests. | High |
| Responsive design | Tailwind responsive layouts across pages. **Partially Implemented; 🟠 Development.** | Breakpoints used throughout; signup has a single laptop-fit assertion. | N/A. | N/A. | No automated overflow/touch-target checks. | One 1366×768 signup check in Chromium. | Add device/browser matrix and reusable no-overflow assertions. | Medium |
| Accessibility | Semantic headings, labels, focus styles, status/alert roles appear in forms. **Partially Implemented; 🟠 Development.** | Several accessible primitives and labelled forms exist. | N/A. | N/A. | No axe integration or documented WCAG baseline. | Incidental role/label assertions only. | Add axe checks, keyboard/focus tests, contrast review, skip link and live-region audit. | High |
| SEO | Root/page metadata, JSON-LD, `robots.txt`, and `sitemap.xml`. **Partially Implemented; 🟡 Beta Ready.** | Root and most content pages define metadata; structured data includes organization/software/site/breadcrumb/FAQ. | Static assets only. | Public crawlers cannot reach marketing pages placed behind auth middleware matcher only indirectly: `(workspace)` itself is not a URL matcher, but its layout redirects via DAL. | No automated metadata/link/schema validation. | None. | Reconcile sitemap URLs with auth-gated layout; test canonical/OG/schema and sitemap freshness. | Medium |

## Identity, tenancy, and security workflows

| Feature | Description and status | Frontend implementation | Backend implementation / API | Database dependencies | Auth / authorization | Validation / errors / logging / audit | Coverage | Known gaps and recommendation | Priority |
|---|---|---|---|---|---|---|---|---|
| Login | Email/password login plus development-only demo login. **Partially Implemented; 🟡 Beta Ready.** | `/login`, `LoginForm`; signup and recovery links. | Server action calls Supabase `signInWithPassword`; demo uses signed HTTP-only cookie. | Supabase Auth; no application table write. | Public; successful users go to dashboard. | Zod length/email checks; non-enumerating invalid-credential message. No failed-login audit/rate limit in app. | Unit tests for demo policy; Playwright invalid credentials/demo login (demo conditional). | Preserve requested `next` after login; add real Supabase login/logout integration and rate-limit observability. | High |
| Logout | Ends demo/Supabase session. **Partially Implemented; 🟡 Beta Ready.** | Sign-out form in top bar. | Server action deletes demo cookie and calls `auth.signOut()`. | Supabase Auth cookies. | Authenticated shell. | Supabase sign-out errors ignored; no audit event. | Conditional demo Playwright test. | Handle/log sign-out failure and test Supabase session invalidation. | Medium |
| Signup | Collects name, email, phone, organization, password, confirmations and policy consent. **Partially Implemented; 🟠 Development pending deployed migration verification.** | `/signup`, `SignupForm`; responsive two-column form and feedback states. | Server action validates then calls `supabase.auth.signUp()` with metadata and callback URL. | `auth.users`; bootstrap trigger; profiles, organizations, organization_members, audit_logs. | Public; email confirmation governed by Supabase. | Strong Zod schema, safe known-error mapping, detailed server console events. Consent is validated but no durable consent record/version. | Signup schema/error unit tests and UI-fit Playwright test; no full signup E2E. | Verify migrations in production; add disposable-user E2E, cleanup, consent ledger, abuse controls. | **Critical** |
| First-user bootstrap | Creates profile/workspace/Owner membership after Auth insertion. **Partially Implemented; 🟠 Development.** | No distinct UI; signup success asks user to verify email. | `bootstrap_new_auth_user()` trigger in migration 0007; callback also invokes idempotent `complete_signup_onboarding()`. | Auth trigger plus four public tables. | Trigger is `SECURITY DEFINER`; callback requires authenticated user. Owner role assigned. | Trigger raises on missing metadata/DB errors and writes organization-create audit. Console logs only around signup/callback redirects. | No automated migration/trigger test; generic Supabase integration creates users but does not assert bootstrap. | Critical release blocker until applied and tested against production-like Supabase. Add SQL/integration assertions and rollback/runbook. | **Critical** |
| Email verification | PKCE callback exchanges code and completes onboarding. **Partially Implemented; 🟠 Development.** | Signup confirmation and `/resend-verification`. | `GET /auth/callback`; resend server action. | Supabase Auth, onboarding RPC. | Public callback; RPC after session establishment. Safe local `next` validation. | Redirect-only error states; resend deliberately prevents enumeration but ignores provider errors; no audit. | No end-to-end email/callback test. | Surface recoverable callback state, log correlation ID, test expired/reused token and mail delivery. | **Critical** |
| Password reset | Request and authenticated password update. **Partially Implemented; 🟠 Development.** | `/forgot-password`, `/reset-password`. | Supabase reset-email and `updateUser`; callback supports safe `next=/reset-password`. | Supabase Auth. | Request public; reset requires recovery session but route itself is not middleware protected. | Email and password validation; request/resend provider errors are ignored to prevent enumeration. | No tests. | Add recovery-token, expiry, session-revocation and email-delivery E2E; log provider failures securely. | High |
| User profile | Profile row is bootstrap metadata only. **Stub; 🔴 Not Implemented as user-facing feature.** | No profile page/editor/avatar/preferences. Top bar displays session email/org. | No profile API/action. | `profiles` (migration adds `phone_number`, but Drizzle schema omits it). | Tenant user owns identity; no profile-specific policy documented beyond base RLS. | Signup validates input; no update validation/errors/audit. | Bootstrap not tested; no UI tests. | Reconcile schema, implement view/edit and audit sensitive changes. | High |
| Organizations | Initial organization creation and session selection. **Partially Implemented; 🟠 Development.** | `/onboarding` creates one organization; settings shows static configuration. No switcher/editor. | `create_organization` and `complete_signup_onboarding` RPCs; session DAL chooses first active membership. | organizations, organization_members, profiles. | Authenticated; creation RPC assigns owner. No multi-org selection. | Name 2–100 chars, randomized slug; generic UI error, server console log. Bootstrap logs create action. | Conditional onboarding E2E only. | Resolve duplicated onboarding paths, add slug collision/multi-membership behavior and org administration. | High |
| Membership | Active organization membership supplies tenant and role. **Partially Implemented; 🟠 Development.** | Role displayed; no invite/member management UI. | DAL queries first active membership. | organization_members and member_role enum. | Roles: owner/admin/reviewer/member/viewer. | RLS policies protect tenant reads/writes; no invitations/audit UI. | Optional Supabase RLS integration test. | Add invites, lifecycle/deactivation, deterministic org selection, last-owner protection, audit and role tests. | **Critical** |
| Roles/permissions | Coarse upload/lifecycle and separate platform-admin controls. **Partially Implemented; 🟠 Development.** | Navigation/features are not comprehensively hidden by role. | Upload allows owner/admin/reviewer/member; invoice lifecycle checks owner/admin/reviewer/member; feedback admin uses platform role. | member_role and platform_admin_role enums; RLS/functions. | No requested `manager` or `standard user` labels; closest are reviewer/member/viewer. | Forbidden routes redirect; APIs use 401/403. | One optional RLS test; no role matrix E2E. | Define canonical permission matrix, enforce in UI/server/RLS, and test every role/boundary. | **Critical** |
| Session/middleware | Refreshes Supabase cookies and protects operational routes. **Partially Implemented; 🟡 Beta Ready.** | Redirects anonymous users to `/login?next=...`. | Next 16 `proxy.ts`; DAL revalidates via `auth.getUser()`. | Supabase Auth cookies; signed dev cookie. | Matcher covers workspace operational/admin routes; workspace layout independently requires context for all route-group pages. | Configuration failure redirects; no centralized request logging. | Protected-path Playwright test omits several matched paths/admin. | Honor `next` after login, add timeout/persistence tests, document cookie policies and complete route matrix. | High |

## Invoice and operational product

| Feature | Description and status | Frontend | Backend / DB / API | Auth / roles | Validation, errors, logging, audit | Coverage | Gaps / recommendation | Priority |
|---|---|---|---|---|---|---|---|---|
| Dashboard | Invoice KPIs and recent invoice list. **Partially Implemented; 🟠 Development.** | `/dashboard`; summary cards and recent links. | `listInvoices()` uses Supabase in real mode, mocks in demo. | Active member. | Repository throws generic load error; no page error boundary/logging. | Demo login only reaches dashboard. | Add tenant-backed integration, empty/error/loading and KPI correctness tests. | High |
| Invoice worklist | Filter, sort, paginate, bulk selection and detail navigation. **Partially Implemented; 🟡 Beta Ready.** | `/invoices` and client components; empty/skeleton/status states. | Server repository reads invoices/vendors with tenant filter. | Active member; archive/delete action permits owner/admin/reviewer/member. | Client filters; RPC mutation validates UUID/operation and redirects on error; lifecycle function writes history/audit. | Utility behavior has no direct tests; no Playwright workflow. | Add server-side pagination/search, optimistic conflict handling, role restrictions and tests. | High |
| Invoice detail | Invoice metadata, exceptions, history, document signed link and lifecycle actions. **Partially Implemented; 🟡 Beta Ready.** | `/invoices/[id]`; not-found response and secure-document link. | Repository tenant-scopes invoice and creates 5-minute storage signed URL. | Active member; mutation role restrictions above. | Generic retrieval/mutation failures; RPC performs audit/history. | None. | Add detail/error/document expiration/access tests; expose line items/taxes currently modeled but not displayed. | High |
| Invoice upload/files | Multi-file client queue and durable Supabase upload/record creation. **Partially Implemented; 🟡 Beta Ready.** | `/upload`; drag/drop, per-file progress/cancel/retry/clear UI. | `POST /api/invoices/upload`; storage bucket then `create_uploaded_invoice` RPC with compensating delete. | Auth + active membership; viewer denied. | PDF/PNG/JPEG, 1 byte–25 MB, magic signature, sanitized key, SHA-256. Request ID returned/logged; DB function writes audit. No malware scanning despite `quarantined` enum. | File-validation unit tests only. | Add API/E2E, storage/RLS, duplicate/retry/idempotency, virus scan and orphan reconciliation. | **Critical** |
| Invoice verification/reviews | Queue pages derived from invoice data. **Stub/Partially Implemented; 🟠 Development.** | `/verification`, `/reviews`, `/accounts-review`, `/payment-queue`, `/activity`; mostly client-side filtered/presentational queues. | Some pages use mock invoice/activity data rather than repositories; no assignment/approval/payment execution workflow. | Any active member; no stage-specific permission enforcement. | Limited UI states; no workflow logging beyond lifecycle RPC. | None. | Connect all queues to tenant DB; define transitions, approvals, segregation of duties and tests. | **Critical** |
| Reports/analytics | Operational report cards and breakdowns from tenant invoice records. **Partially Implemented; 🟡 Beta Ready.** | `/reports` renders summary. | Tenant invoice repository; no exports or dedicated analytics service. | Any active member. | No validation/error/loading/log/audit. | None. | Implement tenant queries, date filters, exports, reconciliation and accuracy tests. | High |
| Opportunities | No opportunity domain route, schema, API, workflow, or test exists. **Planned/absent; 🔴 Not Implemented.** | Legacy components `ExecutionPanel`, `ResearchPanel`, `ResultsTable` and `hooks/useResearch` use opportunity terminology but are not wired to a page. | `data/mockData.ts` only; no persistence/API. | None. | None. | None. | Clarify whether Opportunities remains in Oxiom One scope; otherwise remove dead components/types. | Low pending product decision |
| Messaging | No messaging UI, service, schema or endpoint. **Planned/absent; 🔴 Not Implemented.** | None. | None. | None. | None. | None. | Define requirements before implementation. | Medium |
| Notifications | No notification center, delivery service, preferences, schema or API. **Planned/absent; 🔴 Not Implemented.** | None. | None. | None. | None. | None. | Add domain model and delivery/audit strategy if required. | Medium |
| Settings | Static workspace configuration screen. **Stub; 🟠 Development.** | `/settings` presents company/workflow/integration/security sections; controls are non-persistent. | No actions/API. | Any member; admin-only behavior not enforced. | No validation/errors/log/audit. | Anonymous redirect only. | Implement authorized persistence or clearly label read-only/coming-soon controls. | High |

## Feedback, administration, AI, and integrations

| Feature | Description and status | Frontend | Backend / DB / API | Auth / roles | Controls / coverage | Gaps / recommendation | Priority |
|---|---|---|---|---|---|---|---|
| Product feedback | Durable pros/cons feedback, category, contact/anonymous flags, urgency detection. **Partially Implemented; 🟡 Beta Ready.** | `/feedback` and `FeedbackForm`. | `submit_feedback` RPC; feedback tables and RLS. | Active organization member. Product/security anonymity semantics. | Zod limits, idempotency UUID/content hash, urgency rules; unit tests and conditional demo Playwright. | Demo-mode durable submission is questionable without Supabase; add integration/tenant/privacy tests and user-visible retry diagnostics. | High |
| Feedback administration | Inbox, urgent queue, detail/status/priority/note/assignment, overview/reports. **Partially Implemented; 🟡 Beta Ready.** | `/admin/feedback/**`. | Supabase queries and admin RPCs. | Active platform admin; product/security/platform variants. | Server redirects on errors; structured admin-update log; status model tests; conditional admin E2E only. | Add complete policy/role tests, pagination, error states, action audit consistency and schema reconciliation. | High |
| Weekly feedback analysis | Scheduled deterministic metrics report generation. **Partially Implemented; 🟠 Development.** | Weekly report admin page. | Cron GET/POST endpoint calls a metrics-only engine and persists run/report/alert rows. | Bearer cron secret using timing-safe comparison. | Report schemas and run/error records exist; unit tests cover period/key/metrics output. | Endpoint allows GET to mutate; no request replay/rate control, endpoint/integration test, or monitoring. Use POST only and add job observability. | High |
| AI features | The `openai` package is declared, but no runtime OpenAI client call exists; invoice “AI processing/OCR” is marketing language/status modeling only. **Planned; 🔴 Not Implemented.** | No interactive AI page. | Weekly feedback is deterministic metrics-only; no invoice extraction or generative AI worker. | None beyond the unused package dependency. | No AI-specific validation, provider logging, audit or tests. | None. | Remove the unused dependency or define an approved AI architecture, privacy controls, deterministic adapter tests and explicit product labeling before implementation. | High |
| External integrations | Supabase and Vercel cron are implemented; ERP/payment are absent and email is Supabase-managed. **Partially Implemented; 🟠 Development.** | Settings/marketing mention integrations but do not configure them. | Supabase Auth/PostgREST/Storage and Vercel cron. No webhooks. | Server/environment credentials. | Basic config checks; no health checks or circuit breaker. | Add integration registry, connection tests, secret rotation and failure monitoring. | High |
| Administration (general) | Only feedback platform administration exists. **Stub; 🟠 Development.** | No user/org/role/system administration. | No general admin API. | Platform admin applies only to feedback. | No coverage outside feedback. | Implement scoped admin capabilities only after permission model approval. | Medium |

## Platform capabilities

| Feature | Status/readiness | Repository evidence | Missing functionality / risk | Priority |
|---|---|---|---|---|
| API layer | **Partially Implemented; 🟠 Development.** | Two application endpoints plus auth callback; most mutations are server actions/RPCs. JSON upload errors include request IDs. | No versioning, shared error contract, rate limiting, OpenAPI, API integration/performance tests. Docs page may overstate API availability. | High |
| Supabase | **Partially Implemented; 🟠 Development.** | SSR clients, Auth, PostgREST, RPC, Storage and RLS migrations. | Production object/migration state unverified; service health/telemetry absent; anon env name still used as publishable key. | **Critical** |
| Feature flags | **Stub; 🟠 Development.** | Only `ENABLE_DEMO_LOGIN` (strictly dev) and test/env toggles. | No product flag provider, targeting, audit or kill switches. | Low |
| Environment configuration | **Partially Implemented; 🟠 Development.** | Auth config validates public Supabase variables lazily; Drizzle, feedback engine and cron read env directly. | No centralized typed schema, startup validation, `.env.example`, or documented environment matrix. | High |
| Background jobs | **Partially Implemented; 🟠 Development.** | Weekly feedback Vercel cron only. | No invoice extraction/scan/reconciliation jobs, queue, dead-letter handling, alerting or job dashboard. | High |
| Logging | **Partially Implemented; 🟠 Development.** | Select console JSON/events and request IDs; feedback runs persist error details. | Inconsistent structured logging, no redaction contract, correlation across requests, sink, metrics or alerting. | High |
| Monitoring | **Not Implemented; 🔴 Not Implemented.** | No error/APM/uptime/metric integration in repo. | Add error tracking, service-level indicators, synthetic auth/upload smoke and alerts. | **Critical** |
| Error pages | **Not Implemented; 🔴 Not Implemented.** | Invoice detail calls framework `notFound()`, but no custom `error.tsx`, `global-error.tsx`, or `not-found.tsx`. | Add branded recoverable boundaries, 404, logging and tests. | High |
| Performance | **Partially Implemented; 🟠 Development.** | Server components and Next/font; client worklist filters all loaded invoices. | No budgets, Web Vitals collection, Lighthouse/load tests; unbounded client-side list architecture. | Medium |
| CI/CD | **Partially Implemented; 🟠 Development.** | GitHub Actions runs `npm ci`, lint and build on PR/main; Vercel cron config. | Unit/Playwright tests and migrations are not CI gates; no deploy/production smoke, artifact, security scan or rollback workflow. | **Critical** |
| Testing infrastructure | **Partially Implemented; 🟠 Development.** | Node test via `tsx`; optional live Supabase test; Playwright HTML report/failure screenshot/trace. | CI does not execute tests; no fixtures/test-data service, coverage metric, accessibility/visual/API/performance suites. | **Critical** |
| Playwright framework | **Partially Implemented; 🟠 Development.** | Chromium only, `tests/e2e`, HTML report, screenshots and retained traces. | No Firefox/WebKit/device projects, failure video, console/page/network failure guard, POM, visual snapshots, QA summary or CI browser install. | **Critical** |

# Production Readiness Assessment

| Capability | Rating | Release condition |
|---|---|---|
| Public landing/content | 🟡 Beta Ready | Accessibility/link/SEO smoke; decide auth gating for content. |
| Login/logout | 🟡 Beta Ready | Real Supabase E2E and deployment smoke. |
| Signup/verification/bootstrap | 🟠 Development | Prove migrations, trigger/RPC and complete first-user flow. |
| Password recovery | 🟠 Development | Token/email/session E2E. |
| Profiles/orgs/members/roles | 🟠 Development | Management UI, canonical permissions, full RLS tests. |
| Dashboard/invoice read | 🟡 Beta Ready | Tenant integration and failure-state tests. |
| Upload/storage | 🟡 Beta Ready | Malware strategy, API/storage integration and orphan cleanup. |
| Invoice lifecycle queues | 🟠 Development | Replace mock/stub workflows and test approvals. |
| Reports/search/settings | 🟠 Development | Replace mock/static implementations with tenant persistence. |
| Feedback submission/admin | 🟡 Beta Ready | Integration, privacy and admin-policy tests. |
| Weekly feedback metrics | 🟠 Development | Job monitoring, POST-only invocation and provider tests. |
| Opportunities/messaging/notifications | 🔴 Not Implemented | Product requirements and implementations. |
| Security posture | 🟠 Development | Close critical controls and validate RLS/migrations. |
| Accessibility/performance/monitoring | 🟠 Development | Automated gates and telemetry. |
| CI/testing/release gates | 🟠 Development | Execute unit/integration/E2E suites and deployment smoke. |

No capability is marked ✅ because the repository has no evidence of a production smoke run, operational monitoring, or comprehensive release-gate coverage.

# Security Review

| Control | Finding | Evidence / limitation | Recommendation | Priority |
|---|---|---|---|---|
| Authentication | Supabase password auth, PKCE callback, recovery, verification and server-side `getUser`; signed demo session is development-only. | Auth provider configuration and email delivery cannot be proven from source. | Add complete auth integration/smoke suite and provider configuration runbook. | **Critical** |
| Authorization | DAL membership/role checks, upload/action role gates, platform-admin checks. | Many pages show features to every member; role matrix incomplete; server action/RLS equivalence unproven. | Create and test a single permission matrix at UI, action/API and RLS layers. | **Critical** |
| RLS policies | Base migration enables RLS for tenant tables; feedback migration adds specialized policies. | Only one optional integration test; production application unknown. Some security-definer functions require careful review. | Test every table/function cross-tenant, role escalation and inactive membership; inspect `search_path`/grants. | **Critical** |
| Secrets handling | Public Supabase URL/key correctly client-safe; service-role/cron/database values are read server-side. Constant-time cron comparison. | No centralized validation/rotation docs; exception logs may include provider text. | Add typed server/client env schemas, CI secret scanning and log redaction policy. | High |
| Session management | SSR cookie refresh, `auth.getUser()`, safe callback `next`, secure signed demo cookie. | No explicit idle/absolute timeout test, concurrent-session policy, post-password-reset revocation test, or login `next` use. | Document policies and automate persistence/expiry/revocation. | High |
| Input validation | Zod on auth/feedback/actions; upload size/type/signature/name checks; UUID checks. | Query filters and dynamic IDs rely partly on Supabase; contact/settings are not implemented. | Maintain schemas at trust boundaries, fuzz upload/forms, cap request body before parsing. | High |
| CSRF protection | Next server actions receive framework-origin protections; API upload relies on authenticated cookie and same-origin client. | No explicit Origin/CSRF validation or security test; cron bearer endpoint also accepts GET. | Verify Next 16 behavior, enforce Origin on cookie-auth mutation endpoints, make cron POST-only. | High |
| XSS protection | React escaping; no `dangerouslySetInnerHTML` found in app code; JSON-LD uses `JSON.stringify`. | User text rendered in feedback/admin views needs regression testing. | Add stored-XSS payload tests and CSP. | High |
| SQL injection | Drizzle/Supabase query builders and fixed RPC parameters; no string-built SQL in runtime code observed. | Security-definer migration functions remain privileged attack surface. | Review function ownership, `search_path`, execute grants and parameter validation. | High |
| Rate limiting | Supabase provider may rate-limit auth; app maps some rate errors. | No application rate limiter for signup/login/upload/feedback/cron. | Add edge/server throttles, quotas and abuse monitoring. | **Critical** |
| File security | MIME allowlist, magic bytes, size, hashing, safe storage name, tenant prefix. | No malware scan/quarantine workflow, content disarm, download headers or retention enforcement. | Quarantine then scan before ready; add signed-download and cleanup policies. | **Critical** |
| Sensitive client exposure | No service-role/database/cron secret referenced by client components found. | No automated bundle/response secret scan or CSP/security headers configuration. | Add headers and CI scans for secrets/PII. | High |

# Technical Debt Register

| ID | Description | Impact | Recommendation | Effort | Priority |
|---|---|---|---|---|---|
| TD-01 | Production migrations 0006/0007 and trigger/RPC state are not verifiable from source alone. | First signup can fail atomically. | Add deploy migration gate and production catalog smoke. | M | **Critical** |
| TD-02 | Drizzle `profiles` schema omits migration-added `phone_number`. | Type/schema drift and unsafe future migrations. | Add column to schema and generate consistent snapshot. | S | High |
| TD-03 | Migration 0004 defines feedback theme tables absent from Drizzle schema exports. | Schema drift; tooling can propose destructive changes. | Model all tables or explicitly manage raw-SQL objects with checks. | M | High |
| TD-04 | Several operational pages use mock data while authenticated production pages read real DB elsewhere. | Misleading data and inconsistent tenant behavior. | Route all product data through repositories; reserve mocks for fixtures. | L | **Critical** |
| TD-05 | Search and reports are globally mock-backed. | Incorrect results and no tenant isolation semantics. | Implement tenant-scoped queries and contract tests. | L | High |
| TD-06 | Role vocabulary lacks requested manager/standard-user roles and UI gates are inconsistent. | Authorization ambiguity/escalation risk. | Approve canonical matrix and migrate enum/policies/UI/tests. | L | **Critical** |
| TD-07 | Two onboarding mechanisms (`create_organization` and bootstrap/completion) overlap. | Race/duplicate complexity and difficult recovery. | Define one idempotent state machine and recovery path. | M | High |
| TD-08 | No custom error/loading/not-found architecture. | Poor recovery and invisible production failures. | Add boundaries, correlation IDs and telemetry. | M | High |
| TD-09 | Console logging is inconsistent and monitoring is absent. | Failures cannot be detected or traced reliably. | Adopt structured logger/APM with redaction and alerts. | M | **Critical** |
| TD-10 | CI omits unit, integration and E2E tests. | Regressions can deploy. | Add tiered required checks and artifacts. | M | **Critical** |
| TD-11 | Playwright is Chromium-only and lacks shared guards/fixtures/data cleanup. | Low browser/device confidence and flaky expansion path. | Build fixtures/POM, browser/device projects and CI sharding. | L | **Critical** |
| TD-12 | Default create-next-app README does not document the system. | Operator/developer error. | Replace with architecture, env, migration, test and runbook docs. | M | High |
| TD-13 | Dense one-line source files in auth/feedback reduce reviewability. | Higher defect/merge risk. | Format consistently and enforce formatter. | M | Medium |
| TD-14 | Marketing/documentation asserts features that are mock-backed or absent. | Customer expectation and compliance risk. | Add claim review tied to this inventory. | S | High |
| TD-15 | No persisted policy-consent version/timestamp at signup. | Weak compliance evidence. | Add consent ledger with policy versions and audit event. | M | High |
| TD-16 | Upload has no scan, idempotency guarantee, or orphan reconciliation. | Security/storage/data consistency risk. | Add quarantine scanner, idempotency key and scheduled reconciliation. | L | **Critical** |
| TD-17 | Invoice listing loads all records and filters/paginates client-side. | Degrades with tenant scale. | Server-side cursor pagination/filter/sort and indexes review. | L | Medium |
| TD-18 | Root has both `next.config.js` and `next.config.ts`. | Configuration ambiguity. | Consolidate after checking Next 16 docs. | S | Medium |

# Missing Features

Only repository-evidenced gaps are listed; items are not assertions of approved roadmap scope.

| Missing capability | Evidence of expectation | Status | Suggested next step |
|---|---|---|---|
| Opportunity creation/management | Legacy opportunity types/components and prior QA scope, but no route/schema/API | 🔴 Not Implemented | Product decision: implement domain or delete dead code. |
| Messaging | Requested audit scope; no code objects | 🔴 Not Implemented | Define users, channels, retention and notification requirements. |
| Notifications | No code objects | 🔴 Not Implemented | Define in-app/email event model and preferences. |
| User profile management | Profile table exists; no page/actions | 🔴 Not Implemented | Add self-service view/edit with audit. |
| Member invitations and administration | Membership/role table exists; no management workflow | 🔴 Not Implemented | Build invite, accept, role change, disable and last-owner controls. |
| Persistent settings | Settings screen exists without backend | 🔴 Not Implemented | Define settings schema and admin permissions. |
| Real search/reporting | UI exists but is mock-backed | 🔴 Not Implemented for live tenants | Add tenant repositories and tests. |
| Invoice OCR/extraction | Marketing/status fields imply processing; no worker/provider | 🔴 Not Implemented | Define pipeline, human verification and privacy controls. |
| ERP/payment integrations | Marketing/FAQ identifies roadmap; no connectors | 🔴 Not Implemented | Do not advertise as available; define connector architecture. |
| Monitoring/alerting | No integration/config | 🔴 Not Implemented | Add APM, uptime and workflow synthetics. |
| Branded error pages | No error/not-found files | 🔴 Not Implemented | Add and test recovery UI. |
| Enterprise QA release gate | Playwright/CI are minimal | 🔴 Not Implemented | Follow testing order below. |

# QA Coverage Matrix

“Manual” means repository documentation records a procedure/result; none was found. Conditional tests are marked △.

| Feature | Unit | Integration | Playwright | Manual | Principal uncovered risk |
|---|:---:|:---:|:---:|:---:|---|
| Landing/content/navigation | — | — | — | — | Links, responsive, SEO, a11y |
| Login validation | ✅ | — | ✅ | — | Real provider success/session |
| Demo login/logout | ✅ | — | △ | — | Conditional environment |
| Signup validation/error mapping | ✅ | — | UI only | — | Auth insert/email/bootstrap |
| Email verification/resend | — | — | — | — | Complete callback path |
| Password recovery/reset | — | — | — | — | Token/session behavior |
| Organization onboarding | — | — | △ | — | DB state and cleanup |
| RLS/tenant roles | — | △ | — | — | Full table/function/role matrix |
| Dashboard | — | — | Incidental | — | KPI/data/error states |
| Invoice list/detail/lifecycle | — | — | — | — | Persistence, concurrency, permissions |
| Upload validation | ✅ | — | — | — | Endpoint/storage/RPC/scan |
| Reports/search/settings | — | — | — | — | Mock/static behavior |
| Feedback model/weekly logic | ✅ | — | △ | — | RPC/RLS/provider/job |
| Feedback administration | Partial | — | △ | — | All roles/actions/privacy |
| API endpoints | — | — | — | — | Status contracts, latency, failures |
| Accessibility | — | — | — | — | Critical WCAG violations |
| Visual/responsive | — | — | One viewport | — | Browsers/devices/regressions |
| Performance/security | — | Partial RLS | Anonymous redirects | — | Budgets and boundary attacks |
| Production smoke | — | — | — | — | Deployment health |

# Database Audit

## Tables and enums

| Object | Purpose | Key relationships/indexes | RLS / consistency finding |
|---|---|---|---|
| `organizations` | Tenant/workspace | Unique slug | Base migration enables tenant RLS. |
| `profiles` | App identity mapped to `auth.users` | PK is Auth user; unique email; partial unique phone index from 0006 | **Drift:** Drizzle schema omits `phone_number`. |
| `organization_members` | User-to-tenant role and active flag | Unique org/user; user index | Central tenant authorization; no invitation/history model. |
| `vendors` | Tenant suppliers | Unique normalized name per org; org index | Tenant RLS. |
| `invoices` | Invoice header/lifecycle | Vendor/assignee/creator FKs; tenant/status/vendor/due indexes; unique org/vendor/number | Tenant read/write/update policies; duplicate semantics allow null vendor/number cases. |
| `invoice_items` | Invoice lines | Unique invoice/position; org index | Tenant RLS; not consumed by current UI. |
| `invoice_taxes` | Invoice taxes | Invoice/org indexes | Tenant RLS; not consumed by current UI. |
| `attachments` | Stored document metadata | Unique storage key; org/invoice index | Tenant RLS and storage policies; scan state modeled but not executed. |
| `invoice_status_history` | Lifecycle transition history | Org/invoice/time index | Tenant read/insert; RPC writer. |
| `audit_logs` | Tenant audit records | Org/time and invoice indexes | Tenant read/insert; coverage is workflow-specific, not universal. |
| `platform_admins` | Feedback platform authorization | User PK | RLS self-read; privilege management is out-of-band. |
| `feedback_submissions` | Product feedback | Idempotency and admin queue indexes | RLS/RPC controlled; soft delete. |
| `feedback_source_identities` | Restricted feedback author mapping | Feedback PK | Security/platform admin visibility. |
| `feedback_status_history` | Feedback status trail | Feedback/time index | Admin policies. |
| `feedback_admin_notes` | Internal notes | Feedback/time index in SQL migration | Admin policies. |
| `feedback_themes` | Weekly clustering/theme | Defined in migration 0004 | **Drift:** absent from Drizzle schema exports. |
| `feedback_theme_memberships` | Theme-to-source/report mapping | FKs/indexes in migration | **Drift:** absent from Drizzle schema exports. |
| `feedback_weekly_reports` | Generated insights/metrics | Period index | Admin read. |
| `feedback_engine_runs` | Job execution/idempotency/error record | Unique idempotency key | Admin read. |
| `feedback_admin_alerts` | Urgent/report alerts | Feedback/report references | Admin read/update through policies. |

Enums: `member_role`, `invoice_status`, `attachment_status`, `audit_action`, `feedback_status`, `feedback_priority`, `platform_admin_role`, and `feedback_run_status`. Migration 0005 changes feedback semantics and must be assessed together with 0004.

## Functions, triggers, policies, storage, and views

| Object | Purpose/status | Audit finding |
|---|---|---|
| `handle_new_auth_user()` | Legacy profile trigger function from 0001 | **Deprecated behavior:** trigger is dropped in 0006/0007; function may remain orphaned. Remove after dependency check. |
| `create_organization(name, slug)` | Authenticated organization creation and Owner membership | Used by fallback onboarding; review execute grant, idempotency and conflict behavior. |
| `complete_signup_onboarding()` | Idempotent post-verification profile/org/membership completion | Used by callback; depends on Auth metadata. Production existence unverified. |
| `bootstrap_new_auth_user()` | Auth insert bootstrap | 0007 recreates `on_auth_user_created` AFTER INSERT trigger. Production existence/active state unverified. |
| `create_uploaded_invoice(...)` | Atomic invoice/attachment/audit creation | Used by upload API; storage upload precedes DB call. |
| `manage_invoice_lifecycle(...)` | Archive/delete/restore lifecycle with history/audit | UI exposes archive/delete only. |
| `is_platform_admin(...)` | Feedback authorization helper | Security-definer function; grants constrained to authenticated. |
| Feedback RPCs | Submission, admin update/assignment and supporting controls | Used by feedback actions; inventory should be kept synchronized with 0004/0005 SQL. |
| Storage bucket `invoice-attachments` | Private invoice documents | Created/configured in 0002 with policies; no scanner/lifecycle policy in app. |
| Views | None found | Reporting currently has no database views/materialization. |
| RLS | Base tenant policies plus feedback policies | Good structural start; optional integration test covers only selected cross-tenant cases. |

## Migration ledger

| Migration | Purpose | Journaled | Finding |
|---|---|:---:|---|
| 0000 | Base tenant/invoice schema, indexes, RLS | ✅ | Snapshot exists only for initial schema. |
| 0001 | Auth profile trigger and organization RPC | ✅ | Trigger path superseded; function cleanup needed. |
| 0002 | Invoice storage/RPC/policies | ✅ | Validate bucket configuration in each environment. |
| 0003 | Invoice lifecycle RPC | ✅ | Add SQL integration coverage. |
| 0004 | Product feedback full schema/RLS/RPCs | ✅ | Some tables absent from Drizzle TS schema. |
| 0005 | Simplified beta feedback behavior | ✅ | Raw SQL evolution not represented by a new snapshot. |
| 0006 | Phone and verified onboarding RPC; drops old trigger | ✅ | Production application unverified. |
| 0007 | First-user bootstrap function/trigger | ✅ | Production application unverified; critical ordering with 0006. |

**Database release blocker:** repository presence and journal entries do not prove deployed state. Before release, query the production migration ledger, `pg_proc`, `pg_trigger`, policies and storage configuration, then perform a disposable first-user transaction and verify every resulting row.

# API Audit

Server Actions are included because they form the application mutation API.

| Endpoint/action | Purpose | Authentication | Request → response | Error conditions | Status |
|---|---|---|---|---|---|
| `GET /auth/callback` | Exchange PKCE code; optional safe redirect; complete onboarding | Code establishes session | Query `code`, optional local-path `next` → 302 login/reset/onboarding/dashboard | Missing/invalid code, onboarding RPC error are redirect-coded, not JSON | Partial |
| `POST /api/invoices/upload` | Store and create invoice attachment | User + active org; owner/admin/reviewer/member | Multipart `file` → `201 {ok,data}` with invoice metadata | 400 malformed/missing; 401; 403; 413; 415; 503 storage/DB, all JSON with request ID except framework failures | Partial; no integration test/rate limit |
| `GET|POST /api/internal/feedback/weekly` | Run previous-period feedback analysis | Bearer cron secret | No body → `{ok,data}` | 401 or 500 generic error | Partial; mutating GET should be removed |
| `login` action | Supabase/demo login | Public | username/password → field error or redirect | Invalid/config/provider errors | Partial |
| `logout` action | Clear sessions | Authenticated UI | Empty form → redirect | Provider error ignored | Partial |
| `signup` action | Create Auth identity | Public | Signup fields/consents → success/error state | Validation, known/unknown Supabase, network exception | Partial; full flow untested |
| `requestPasswordReset` | Send recovery email | Public | email → non-enumerating success | Invalid email/config; provider errors intentionally suppressed | Partial |
| `resetPassword` | Update password | Recovery session expected | password/confirmation → success/error | Weak/mismatch/expired session | Partial |
| `resendVerification` | Resend signup email | Public | email → non-enumerating success | Invalid/config; provider errors suppressed | Partial |
| `createOrganization` | Create tenant via RPC | User | name → dashboard redirect | Validation/RPC | Partial/overlaps bootstrap |
| `submitFeedback` | Durable tenant feedback | Active member | Form fields/idempotency → state | Validation/RPC | Beta |
| Invoice archive/delete actions | Lifecycle RPC | Active owner/admin/reviewer/member | UUID form value → revalidated redirect | Invalid ID/RPC | Beta |
| Feedback admin actions | Update status/priority, note, assign | Platform admin | UUID/status/priority/reason/note → redirect/revalidate | Validation/RPC/insert | Beta |

No public REST API, webhook receiver, GraphQL interface, API specification, versioning, retry contract, or response-time threshold is implemented.

# UI Audit

## Route inventory

| Route group | Pages | UX/state audit |
|---|---|---|
| Public root/auth | `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/resend-verification`, `/onboarding` | Consistent card/brand styling. Auth forms have labels and inline alert/status. Missing route-level loading/error boundaries and full mobile/a11y tests. |
| Core workspace | `/dashboard`, `/invoices`, `/invoices/[id]`, `/upload` | Cohesive shell and useful empty/skeleton states in invoice/upload components. Dashboard/detail lack explicit loading/error UI. |
| Workflow queues | `/verification`, `/reviews`, `/accounts-review`, `/payment-queue`, `/activity` | Visually complete but several are mock/presentation-backed; workflow empty/error/loading and permissions are incomplete. |
| Workspace utilities | `/reports`, `/settings`, `/feedback` | Feedback is durable; reports mock-backed and settings static. |
| Feedback admin | `/admin/feedback`, `/inbox`, `/urgent`, `/reports`, `/[id]` | Functional administrative surfaces; limited visible error states, pagination and automated coverage. |
| Documentation/content | `/about`, `/faq`, `/contact`, `/support`, `/security`, `/compliance`, `/changelog`, `/release-notes`, `/legal/**`, `/docs/**` | Extensive, consistent content; all inherit authentication-requiring workspace layout. Contact/support lack forms/ticketing. |
| Solutions | `/solutions` plus 20 slug pages listed in `app/(workspace)/solutions/` | Shared template improves consistency and metadata; verify claims, links, auth intent, mobile/a11y. |
| Errors | Framework default 404/error | No branded or observable application error UX. |

## Component inventory

| Component family | Components | Finding |
|---|---|---|
| Design primitives | `Badge`, `Button`, `Input`, `Select`, `KPICard`, `ProgressBar`, `ScoreBadge`, `Icons` | Consistent Tailwind vocabulary; no Storybook/component accessibility tests. |
| Shell | `AppShell`, `Sidebar`, `TopBar`, `GlobalSearch`, `workspaceNavigation`, `InvoiceIntakeProvider` | Reusable, but role filtering, mobile/keyboard tests and live-data search are missing. |
| Invoice worklist | `InvoicesPageClient`, `InvoiceWorklist`, filters/table/pagination/summary/status/empty/skeleton/bulk toolbar | Strong decomposition; test utilities and interactions independently. |
| Upload | Page client, dropzone, queue/row/status/summary/toolbar, `useUploadManager`, constants/utils | Clear state separation; add retry/cancel/API integration and accessible drag/drop tests. |
| Feedback | `FeedbackForm`, admin `FeedbackTable` | Durable forms; expand error/privacy/accessibility coverage. |
| Marketing/SEO | `SolutionPageTemplate`, `StructuredData` suite | Shared source of truth; add snapshot/schema/link tests. |
| Legacy opportunity research | `ExecutionPanel`, `ResearchPanel`, `ResultsTable`, `hooks/useResearch`, `data/mockData` | Unwired/dead or planned; label/remove to prevent mistaken completeness. |

Across the UI, loading is localized rather than route-level, error states frequently redirect or throw, and empty states are strongest in invoice/upload. Accessibility and responsive quality cannot be considered validated without automated and manual audits.

# Audit Logs and Audit Trail Coverage

| Workflow | Audit coverage | Gap |
|---|---|---|
| First organization bootstrap | `audit_logs` create record in 0007 | Verify actor/entity semantics and deployment. |
| Invoice upload | `create_uploaded_invoice` writes audit entry | Storage failure/orphan cleanup events are console-only. |
| Invoice lifecycle | RPC writes status history and audit | UI supports only subset; denied attempts not audited. |
| Feedback status | Dedicated feedback status history | Assignment/note and all admin changes need confirmed uniform audit. |
| Feedback engine | Persistent engine run/provider/error/report records | Endpoint access/replay not audited. |
| Authentication | Console events for signup failures | Login/logout/reset/verification successes/failures lack durable security audit. |
| Profile/org/member/settings | No complete mutation workflows | Add audit when implemented; membership changes are especially sensitive. |

# Risk Register

Likelihood and impact use **Low / Medium / High**. Severity is the combined engineering priority. Owners are accountable disciplines, not named individuals. “Open” means mitigation is incomplete; “Monitoring” requires an implemented control and evidence.

| Risk ID | Description | Likelihood | Impact | Severity | Mitigation | Owner | Current status |
|---|---|---|---|---|---|---|---|
| RISK-001 | First-user signup fails if migrations/trigger/RPC are absent or invalid. | High | High | Critical | Deployment migration gate, catalog assertions and disposable email-to-dashboard test. | Engineering / Release | Open; repository fix exists, production unverified |
| RISK-002 | Incomplete role/RLS matrix permits unintended tenant or feature access. | Medium | High | Critical | Canonical permission matrix plus cross-tenant tests for every table/RPC/route. | Security / Engineering | Open |
| RISK-003 | Mock-backed queues/search/reports are mistaken for durable production data. | High | High | Critical | Replace with tenant repositories or visibly label/disable demo functionality. | Product / Engineering | Open |
| RISK-004 | Uploaded documents are accepted without malware scanning/quarantine completion. | Medium | High | Critical | Quarantine, scan, content controls and safe release workflow. | Security / Platform | Open |
| RISK-005 | Storage succeeds but DB creation/cleanup fails, leaving inconsistent artifacts. | Medium | Medium | High | Idempotency, durable reconciliation and orphan cleanup alerts. | Platform | Open |
| RISK-006 | CI can merge without unit/E2E/migration gates. | High | High | Critical | Required tiered checks with artifacts and deployment smoke. | QA / Platform | Open |
| RISK-007 | Production failures are not detected because monitoring/alerting is absent. | High | High | Critical | APM/error tracking, health checks, SLOs and actionable alerts. | Platform / Operations | Open |
| RISK-008 | Auth recovery/verification/session regress without full provider E2E. | Medium | High | High | Disposable inbox tests for success, expiry, reuse, revocation and logout. | QA / Security | Open |
| RISK-009 | Raw SQL migrations and Drizzle schema drift cause unsafe future migrations. | Medium | High | High | Reconcile phone/theme objects and add schema-diff checks. | Data / Engineering | Open |
| RISK-010 | Missing rate limits enable auth/upload/feedback abuse. | Medium | High | Critical | Edge/application throttles, quotas, provider controls and monitoring. | Security / Platform | Open |
| RISK-011 | Marketing/content claims exceed implemented capabilities. | Medium | Medium | High | Product/legal claim review linked to lifecycle and readiness state. | Product / Legal | Open |
| RISK-012 | No tested backup/restore or disaster-recovery procedure exists in-repo. | Medium | High | Critical | Document RPO/RTO, provider backups and scheduled restore exercises. | Operations / Data | Open |
| RISK-013 | Accessibility regressions ship without a WCAG gate. | High | Medium | High | Axe, keyboard/assistive review and supported-device regression suite. | Frontend / QA | Open |
| RISK-014 | Security/privacy posture is weakened by missing headers, retention and consent ledger. | Medium | High | High | CSP/security headers, retention schedule, consent versioning and privacy review. | Security / Legal | Open |

# Production Incident Register

Only production incidents supported by the provided issue history or repository evidence belong here. Do not record test failures as production incidents. Status remains unverified until deployment evidence is attached.

| Incident ID | Date | Root cause | Resolution | Preventive action | Related PR | Related release |
|---|---|---|---|---|---|---|
| INC-2026-001 | 2026-07-27 | First-administrator signup returned a generic failure; the signup action discarded provider diagnostics, and first-user bootstrap migration/journal/deployment state was inconsistent. | Repository baseline `17b0197` adds error mapping/logging and migration 0007 bootstrap. Production application and end-to-end resolution are **not verified**. | Migration deployment gate, catalog checks, full first-user integration test, production smoke and monitoring. | TBD / not evidenced in local history | Unreleased / not verified |

**Incident continuity rule:** never delete or rewrite an incident row. Append follow-up status, corrective PR and verified release information. A resolved incident requires production evidence; a code merge alone is not resolution evidence.

# Release History

Repository version metadata declares `1.0.0`, but no tag/deployment manifest proves a production release. The row therefore distinguishes declared contents from verified deployment. Append releases; never replace history.

| Version | Date | PRs included | Database migrations | Breaking changes | New features | Bug fixes | Rollback strategy |
|---|---|---|---|---|---|---|---|
| 1.0.0 (declared; deployment unverified) | Repository state 2026-07-27 | History references #15–#23; exact deployed set unverified | 0000–0007 present/journaled; applied state unverified | Auth/onboarding trigger evolution may be operationally breaking if migrations are skipped | Platform/content, invoice workflow, feedback, auth/signup work reflected in repository | Auth build/sign-in and signup diagnostics/bootstrap reflected in history | Revert application to last verified deployment; restore DB only through an approved forward/rollback migration and tested backup. No repository-specific tested rollback runbook exists. |

# Feature Lifecycle

Lifecycle is distinct from implementation status: **Planned → In Development → Internal Testing → QA → Beta → Production → Deprecated → Removed**. A feature moves forward only with evidence; no feature is marked Production because deployed smoke evidence is unavailable.

| Lifecycle stage | Feature IDs | Evidence / exit condition |
|---|---|---|
| Planned | PROF-001, OPP-001, MSG-001, NOTIF-001 | Requirements or schema hints only; approve scope and architecture before development. |
| In Development | SRCH-001, AUTH-002, AUTH-003, AUTH-004, TEN-001, TEN-002, DASH-001, INV-003, RPT-001, SET-001, AI-001, FILE-001, OBS-001, QA-001 | Partial/stub implementation or missing release controls. |
| Internal Testing | INV-002 | Core code and unit validation exist; integration/security workflow evidence is missing. |
| QA | AUTH-001, INV-001, FDB-001, FDB-002 | Meaningful behavior exists with some automated coverage; full acceptance matrix remains incomplete. |
| Beta | WEB-001, NAV-001 | Usable controlled scope, pending accessibility/responsive/production evidence. |
| Production | — | Requires dated deployment, smoke, monitoring and completed applicable gates. |
| Deprecated | Legacy `handle_new_auth_user()` behavior; unwired opportunity research code is a removal candidate | Confirm dependencies before removal; retain historical references. |
| Removed | — | Record removed feature IDs here permanently with removal PR/release. |

# Code Quality Dashboard

| Metric | Current evidence | Status | Target / action |
|---|---|---|---|
| Lint | `npm run lint` passed during this audit update | Pass | Required PR check |
| Unit tests | 23 discovered: 22 passed, 1 conditional Supabase integration test skipped | Pass with conditional gap | All deterministic units required |
| Integration tests | One Supabase RLS suite exists but was skipped without live credentials | Not verified | Ephemeral test project and required critical integrations |
| Playwright | Chromium-only configuration; tests are conditional and not run by current CI | Incomplete | PR smoke plus full browser/device release suite |
| Coverage | No coverage command, threshold or report configured | Unknown — not measured | Instrument line/branch/function coverage; set risk-based thresholds |
| Build | `npm run build` passed for the audited baseline; documentation-only update does not change runtime | Pass at baseline | Required reproducible build |
| Security findings | 8 Critical and 6 High open controls in this audit; no automated security scan | Failing release expectations | Resolve blockers; add dependency/SAST/secret scans |
| Technical debt trend | Baseline register has 18 items; no prior comparable count | Baseline / trend unavailable | Track opened/closed/net each audit |

# Operational Readiness

| Capability | Verified implementation | Readiness | Required evidence/action |
|---|---|---|---|
| Monitoring | No provider/configuration found | Not implemented | Error/APM and workflow metrics with owners |
| Alerting | Feedback records alerts in DB, but no operational delivery/incident alert integration | Not production-ready | Pager/channel routing, thresholds and test alerts |
| Logging | Select console JSON/events and request IDs | Partial | Structured logger, redaction, correlation, retention and central sink |
| Audit logs | Invoice/bootstrap and feedback histories cover selected mutations | Partial | Coverage map for auth/member/settings/admin/denials; immutable retention |
| Backup strategy | No repository runbook or configuration found | Not verified | Document Supabase/storage backup ownership, frequency, retention and encryption |
| Disaster recovery | No RPO/RTO, restore procedure or exercise evidence found | Not implemented | Approved plan and scheduled restore/failover exercise |
| Health checks | No application/dependency health endpoint found | Not implemented | Auth/DB/storage/job-aware health and external synthetic probes |
| Observability | No traces, dashboards, SLOs or Web Vitals collection found | Not implemented | Correlated logs/metrics/traces and service dashboards |

# Compliance Checklist

This is an engineering readiness review, not legal certification.

| Area | Evidence | Status | Gap / next action |
|---|---|---|---|
| OWASP Top 10 | RLS, validation, React escaping, parameterized clients and auth guards exist | Partial | Threat model; rate limits; headers/CSP; dependency scanning; SSRF/file abuse and authorization tests |
| GDPR readiness | Privacy/legal content and feedback anonymity controls exist | Partial / not legally verified | Data inventory, lawful basis, DSR/export/delete workflows, processor records and breach runbook |
| Privacy controls | Tenant RLS, private storage/signed URLs, restricted feedback identity | Partial | Retention/deletion, consent ledger, log redaction and privacy tests |
| Data retention | No enforceable retention jobs/policies documented | Not implemented | Approve schedules for Auth, invoices/files, feedback, audit and logs; automate disposal/legal hold |
| Audit logging | Selected invoice/bootstrap/feedback records | Partial | Security/auth/member/admin coverage and immutable retention/export |
| Security headers | No explicit CSP/HSTS/Permissions-Policy configuration found | Not verified | Define/test headers at Next/Vercel edge and document ownership |
| Accessibility (WCAG) | Semantic labels/roles exist; no axe/manual conformance evidence | Partial | WCAG 2.2 AA audit, critical automated gate and remediation log |
| License compliance | `LICENSE` exists; dependencies have lockfile | Partial | Automated dependency license/SBOM review and exception policy |

# AI Readiness

| Inventory item | Verified state | Readiness / governance action |
|---|---|---|
| Current AI features | None. Weekly feedback engine is deterministic metrics-only; no OpenAI runtime call exists. | Do not label metrics processing as AI. |
| Planned AI features | Marketing references invoice AI/OCR; no approved executable implementation is present. | Planned only; require product/security/privacy approval. |
| AI providers | `openai` dependency is declared but unused; no provider configuration exists in runtime code. | Remove unused dependency or document an approved adapter/provider before use. |
| Prompt locations | None found. | Any future prompt must be versioned, reviewed and traceable to feature/test IDs. |
| Guardrails | None because no AI execution exists. | Before launch: data minimization, injection/content controls, output validation, human review, fallback and incident procedures. |
| Cost monitoring | None. | Define per-tenant/model budgets, alerts and owner before provider use. |
| Token usage | Not collected; no model calls exist. | Persist privacy-safe usage/cost metrics if AI is introduced. |
| Model configuration | None. Feedback run schema can store provider/model, but engine does not populate an AI provider. | Explicit allowlist/versioning, environment validation and rollback are prerequisites. |

# Engineering KPIs

Percentages are reported only where a documented formula exists. **Unknown** is preferable to fabricated precision.

| KPI | Current value | Formula/evidence | Target / interpretation |
|---|---:|---|---|
| Overall completion | 48% | Existing equal-weight capability formula in Final Summary | Trend upward only when evidence changes status |
| Production readiness | 38% | Functionality 40%, security 20%, QA 20%, operations 20% rubric | No release while Critical blockers remain |
| Test coverage | Unknown | No instrumentation/report configured | Establish baseline and risk-based thresholds |
| Accessibility | Unknown | No axe/manual WCAG measurement | WCAG 2.2 AA; zero critical automated violations |
| Security score | Unknown | No scored security assessment; risk register has 8 Critical rows | Define auditable scoring rubric after threat model |
| Performance score | Unknown | No Lighthouse/Web Vitals/budget evidence | Define page/API budgets and supported-device baseline |
| Documentation completeness | 100% for required audit sections; product/runbook completeness unmeasured | 11/11 governance sections requested here are present | Measure architecture/runbook/API documentation separately |
| Open critical defects/risks | 8 | RISK-001, 002, 003, 004, 006, 007, 010 and 012 | Retain explicit IDs and reduce to zero before release |
| Open high-priority defects/debt | 8 | Technical Debt Register rows marked High (TD-02, 03, 05, 07, 08, 12, 14, 15) | Recount on every update; severity and debt are separate registers |
| Release blockers | 7 | Final Summary blocker bullets | Must reach zero with deployed evidence |

# Continuous Improvement Review

Complete this section at the end of every audit. Preserve prior audit snapshots in the Change Log/release/incident registers; update this “current delta” rather than erasing history.

| Review dimension | Change since previous audit | Evidence | Recommended next action |
|---|---|---|---|
| Newly completed features | None | This revision changes governance documentation only. | Do not advance lifecycle without implementation/test evidence. |
| Regressions | No runtime regression identified; one documentation accuracy issue was corrected previously (AI was metrics-only, not provider-backed). | Static audit and passing lint/unit suite; no browser/production run in this revision. | Add automated documentation/traceability checks where practical. |
| Newly introduced technical debt | No runtime debt introduced; governance upkeep is now an explicit recurring obligation. | Documentation-only diff. | Assign audit owners and enforce update policy in PR review. |
| Documentation gaps | Architecture/runbook/API specifications and production evidence links remain absent outside this audit. | Default README and no operational runbooks found. | Prioritize architecture, environment, migration and incident-response runbooks. |
| Test coverage gaps | First-user, verification/recovery, full RLS roles, uploads, browsers/devices, a11y, performance and production smoke remain open. | QA matrix and Code Quality Dashboard. | Execute roadmap Next Sprint testing items first. |
| Security gaps | Rate limiting, file scanning, full authorization proof, headers, retention, monitoring and DR remain open. | Risk and Compliance registers. | Address Critical risks RISK-001/002/003/004/006/007/010/012. |
| Next-sprint priorities | Onboarding proof, auth E2E, CI gates, schema reconciliation, permission matrix. | Future Roadmap. | Owners should convert the five items into accepted work with evidence criteria. |

**Automatic review procedure:** on each audit update, compare the previous audited commit to the new baseline (`git diff --name-status`, route/API/schema/test inventories, migration journal and CI configuration), then update every row above. Automation may collect evidence, but status decisions require accountable review and must never infer production state from repository state.

# Release Readiness Checklist

This checklist is the release decision record for the current audited baseline. A release owner must replace **Not verified** with dated evidence; repository inference is not production verification. Any Critical feature with a failed required gate blocks release.

| Capability / gate | Code complete | Unit tests | Integration tests | Playwright | Accessibility | Performance | Security review | Documentation | Migration complete | Production verified | Decision / evidence gap |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Landing/content | Yes | No | N/A | No | No | No | Partial | Yes | N/A | Not verified | Beta only; content auth intent and claims require review. |
| Login/logout/session | Partial | Partial | Partial/conditional | Partial/conditional | No | No | Partial | Partial | N/A | Not verified | Real-provider flow and session policy tests required. |
| Signup/verification/bootstrap | Partial | Partial | No | Layout only | No | No | Partial | Partial | **Not verified** | **Not verified** | **Release blocker:** migration/catalog/email-to-dashboard proof absent. |
| Password recovery | Partial | No | No | No | No | No | Partial | Partial | N/A | Not verified | Token expiry/reuse/session tests absent. |
| Tenancy/membership/roles | Partial | Partial | Partial/conditional | No | N/A | No | Partial | Partial | Not verified | Not verified | **Release blocker:** complete role/RLS matrix absent. |
| Dashboard/invoice read | Partial | No | No | No | No | No | Partial | Partial | Not verified | Not verified | Tenant data and failure-state coverage absent. |
| Upload/files | Partial | Partial | No | No | No | No | Partial | Partial | Not verified | Not verified | **Release blocker:** scan/idempotency/integration absent. |
| Lifecycle queues | No | No | No | No | No | No | Partial | Partial | Not verified | Not verified | Mock/presentation-backed workflows. |
| Search/reports/settings | No | No | No | No | No | No | Partial | Partial | N/A | No | Mock/static; not production functional. |
| Feedback/admin | Partial | Partial | No | Partial/conditional | No | No | Partial | Partial | Not verified | Not verified | Validate RLS, anonymity and admin boundaries. |
| Weekly feedback metrics | Partial | Partial | No | No | N/A | No | Partial | Partial | Not verified | Not verified | Job/provider/monitoring evidence absent. |
| Cross-cutting release gate | No | Partial | Conditional | Partial | No | No | Partial | **This audit** | Not verified | Not verified | **Release blocker:** CI, monitoring and production smoke incomplete. |

**Gate meanings:** “Yes” is repository-evidenced for that scope; “Partial” means incomplete evidence; “No” means missing or failed; “N/A” must be justified by the feature; “Not verified” means environment evidence was unavailable. Before a release, record links to CI runs, HTML reports, migration output, security approval and deployment smoke in the corresponding decision cell or release changelog row.

# Future Roadmap

Roadmap entries are recommendations derived from verified gaps, not committed delivery dates. Product must approve scope before implementation.

## Next Sprint

1. Prove migrations 0006/0007, trigger/RPC state, email delivery and first-user Owner bootstrap in a production-like disposable test.
2. Add first-user, login/logout, verification and password-recovery integration/E2E coverage with automatic cleanup.
3. Make unit tests and a deterministic Chromium smoke suite required PR checks; publish Playwright artifacts.
4. Reconcile `profiles.phone_number` and feedback theme objects between Drizzle schema and raw migrations.
5. Define and approve the canonical organization-role permission matrix.

## Short Term

1. Enforce/test the permission matrix across navigation, actions, endpoints, functions and all RLS policies.
2. Add structured logging, error monitoring, branded error boundaries and post-deployment synthetic smoke.
3. Harden uploads with quarantine/malware scanning, idempotency, orphan reconciliation and endpoint/storage tests.
4. Replace mock-backed operational queues, global search and reports with tenant-scoped repositories.
5. Add axe accessibility gates and Chromium/Firefox/WebKit responsive projects.

## Medium Term

1. Implement audited profile, organization, membership/invitation and persistent settings management.
2. Add server-side invoice filtering/cursor pagination, workflow concurrency handling and complete lifecycle/approval tests.
3. Establish performance budgets, Web Vitals collection, visual baselines, API contracts and retry/latency tests.
4. Harden weekly feedback processing with POST-only invocation, deterministic integration tests and job alerts; separately approve any future AI provider/privacy design.
5. Replace the scaffold README with architecture, environment, migration, security, QA and operations runbooks.

## Long Term

1. Decide whether opportunity management belongs in Oxiom One; either implement an approved domain or remove legacy mock code.
2. Define and, if approved, implement messaging and notification domains with retention, privacy and delivery controls.
3. Design ERP/payment connectors only after integration security, reconciliation and support ownership are approved.
4. Mature release governance with coverage trends, flaky-test analytics, disaster recovery exercises and SLO reporting.

# Update Policy

`FUNCTIONALITY_AUDIT.md` is the **single source of truth for functional implementation status and production readiness**. Code comments, tickets, marketing pages and PR descriptions may add context but must not contradict this document. Where deployed state differs from repository state, record both explicitly and treat the safer/lower readiness state as authoritative until verified.

## Mandatory update triggers

Update this document in the **same pull request** for:

- every merged feature PR, including material behavior changes and feature removal/deprecation;
- every database schema, migration, table, view, function, trigger, policy, index, storage or seed change;
- every new, modified, versioned or removed API endpoint, Server Action, RPC, webhook or background job;
- every new, moved, materially changed or removed page and major shared component;
- authentication, verification, recovery, session, cookie or identity-provider changes;
- organization-role, platform-role, permission, RLS or authorization-boundary changes;
- infrastructure, deployment, environment-variable, external-service, monitoring or CI/CD changes;
- Playwright project, fixture, suite, device/browser, visual baseline or coverage changes;
- accessibility, performance, security or operational-control changes;
- every release candidate, production deployment, rollback and release milestone.

## Required update procedure

1. Update Document Metadata: increment the document version, date, reviewed date, audited baseline commit, branch, application version and latest migration.
2. Add a Change Log row. Use the real PR/commit when known; use `TBD` before merge and backfill it during merge/release administration. Never invent identifiers.
3. Add or update stable Feature Traceability IDs, file/API/database/UI/test mappings, implementation status and readiness rating.
4. Update dependency and release-readiness cells, attaching dated environment evidence for migration and production claims.
5. Update the detailed inventory, Security Review, Technical Debt Register, Missing Features, QA Matrix, Database/API/UI audits and audit-trail coverage wherever affected.
6. Recalculate completion/readiness scores only when statuses change and retain the published formula.
7. Update roadmap placement, recommended orders and blockers; remove a blocker only with repository and, where applicable, deployed-environment evidence.
8. Have the owning disciplines review their portions: Engineering, QA, Product and Security. Production readiness additionally requires the release owner/operator.

## Versioning and review cadence

- **Patch** (`1.1.x`): evidence, links, dates, wording, test coverage or non-functional corrections without a status change.
- **Minor** (`1.x.0`): a feature/status/readiness, API, schema, role, infrastructure or release-gate change.
- **Major** (`x.0.0`): material product-domain or audit-taxonomy restructuring.
- Review on every release candidate and at least monthly while the product is active. Record “Last Reviewed” even when no findings change.
- The PR author owns the update; reviewers must reject functional changes with a stale audit. Release owners must backfill merge PR/commit identifiers and production evidence.

## Definition of an acceptable status change

- **Implemented/Complete** requires referenced implementation plus appropriate automated tests.
- **Production Ready** additionally requires completed security/accessibility/performance gates as applicable, applied migrations, operational documentation, monitoring and a dated production smoke result.
- Planned marketing or documentation text never counts as implementation.
- Conditional or skipped tests must be shown as conditional/skipped, never as passing coverage.
- When evidence is unavailable, use **Not verified** rather than inference.

## Per-change maintenance checklist

- [ ] Metadata/version and Change Log updated.
- [ ] Traceability row and dependency row updated or added.
- [ ] Frontend/backend/database/API/auth/roles/validation/errors/logging/audit impacts recorded.
- [ ] Unit, integration, Playwright, accessibility, performance and manual evidence updated.
- [ ] Security, debt, missing-functionality and readiness impacts reviewed.
- [ ] Migrations and production state explicitly distinguished.
- [ ] Scores, roadmap, test order and release blockers reassessed.
- [ ] Engineering, QA, Product and Security owners requested where applicable.

# Final Summary

## Scores

These are transparent repository-completeness estimates, not production SLAs. Each audited capability is weighted equally: implemented=100, partial=60, stub=25, absent=0. Based on the 35 executive capabilities above, **overall implementation completion is approximately 48%**. A stricter readiness rubric (functionality 40%, security 20%, automated QA 20%, operations 20%) yields a **production readiness score of 38/100** because critical onboarding deployment evidence, release gates, monitoring, role assurance and multiple real-data workflows are absent.

## Highest-risk areas

1. **First-user signup/bootstrap:** migrations and database objects are critical and not environment-verified.
2. **Authorization/RLS:** partial role gates and limited live cross-tenant coverage leave boundary risk.
3. **Mock-backed operational surfaces:** queues/search/reports can imply durable functionality that does not exist.
4. **Upload security/consistency:** no malware pipeline, idempotency or orphan reconciliation.
5. **Release/operations:** CI does not run tests; monitoring and production smoke are absent.

## Highest-priority improvements and implementation order

1. Verify and integration-test migrations 0006/0007, trigger/RPC and first-user email-to-dashboard flow.
2. Define the canonical role/permission matrix; enforce it in RLS, functions, actions/APIs and navigation; add cross-tenant tests.
3. Make CI run unit tests, migration checks, Chromium smoke and required deployment smoke; add failure artifacts.
4. Add structured logging, error monitoring, health/synthetic checks and branded error boundaries.
5. Harden uploads with quarantine/scanning, idempotency, cleanup and full endpoint/storage tests.
6. Replace mock-backed operational pages, global search and reports with tenant-scoped repositories.
7. Implement profile, membership and persistent settings administration with audit trails.
8. Expand browser/device/a11y/visual/performance coverage, then address lower-risk content polish.
9. Decide opportunity/messaging/notification scope before adding code or QA claims.

## Recommended testing order

1. Migration/catalog tests and disposable first-user onboarding integration.
2. Auth login/logout/recovery/verification and session security.
3. RLS/authorization matrix across every tenant table, RPC and role.
4. Invoice upload → record → document → lifecycle happy/failure/retry paths.
5. Dashboard/worklist/detail data accuracy and empty/error states.
6. Feedback submission/admin/job privacy and idempotency.
7. Chromium PR smoke, then Firefox/WebKit and supported responsive devices.
8. Axe critical violations, visual baselines, API latency/failure contracts and performance budgets.
9. Post-deployment production smoke with non-destructive test accounts/data.

## Release blockers

- No proof that migrations 0006/0007, `on_auth_user_created`, `bootstrap_new_auth_user`, and `complete_signup_onboarding` are applied/active in the target environment.
- No automated complete first-user signup/email/bootstrap/dashboard test.
- CI does not execute unit, integration or Playwright tests.
- Authorization/RLS coverage is incomplete and role behavior is not centrally specified.
- Critical upload security and consistency controls are absent.
- No production monitoring, error tracking, or post-deployment smoke gate.
- Operational pages expose mock/static data without a clear beta/demo label.
