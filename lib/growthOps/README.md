# Growth Operations

Landing Page Registry, Content Registry, and Campaign Tracking -- tools
that help Oxiom's marketing team manage acquisition assets and measure
what's working. Distinct from the Growth Intelligence Platform
(`lib/growth/`, social listening and engagement); these are about content
Oxiom itself publishes and campaigns Oxiom itself runs.

## Modules

| Module | File | Notes |
|---|---|---|
| Landing Page Registry | `landingPageRegistry.ts` | URL, industry, target keyword, publish status, meta title/description, canonical, last updated. In-process, mirrors every other registry this platform has built. |
| Content Registry | `contentRegistry.ts` | Blogs, guides, FAQs, case studies; draft/review/published. |
| Campaign Tracking | `campaignTracking.ts` | Campaign identity (name, source, medium, UTM, landing page) is a new registry; **metrics are not a second counter** -- `computeCampaignMetrics(utmCampaign)` reads `lib/growth/tracking.ts`'s existing click/conversion ledger (built for the Growth Intelligence Platform milestone) and filters it by `utmCampaign`. "Reuse existing tracking where appropriate" is literal here: one ledger, read two ways. `recordCampaignConversion` is a thin wrapper that fixes the metadata shape the filter depends on, so attribution can't drift from a typo'd key. |
| Demo Experience | `demoExperience.ts` | `runDemoExperienceChecks()` verifies the demo dataset (`data/mock*.ts`) is present and internally consistent for each area the milestone lists: Dashboard, Customers, Vendors, Products, Invoices, Bills, Reports, GST, Search, Filters. The GST check calls the real `reconcileItcRecords()` (`lib/itcRecovery/reconciliation.ts`) against the mock purchase/return records -- genuine business logic, not a row count. This verifies data adequacy from server-side code; actual page rendering was verified separately against a running local server (see the milestone's validation results). |
| Readiness Dashboard | `readinessDashboard.ts` | `computeReadinessReport()` aggregates five sections. Demo Data and Growth read real mock/registry data; SEO and Commercial check that the real route files exist on disk (`fs.existsSync`); Platform reads the real Engine Registry, URP Registry, Webhook Engine's Endpoint Registry, and the Event Bus -- the same registries `app/control-center/{engine-registry,reports-platform,webhooks,events}` already read. Nothing here is a hardcoded checklist. |

## Admin Console

- `app/control-center/growth-operations/page.tsx` -- Landing Page Registry, Content Registry, Campaign Tracking. Read-only.
- `app/control-center/readiness/page.tsx` -- Demo Experience checks and the Readiness Dashboard. Read-only.

## What's deliberately not here

No editing UI (register/update functions exist and are tested, same
"functions exist, UI comes later" pattern as every other registry this
session built). No persistence -- in-process, resets on cold start, same
documented limitation as the Engine/Report/Webhook/Opportunity registries
before it.
