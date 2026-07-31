# Growth Intelligence Platform

A social-listening and engagement-workflow tool for Oxiom's own marketing
team -- not an automated social-media posting system. It helps a human
find relevant public discussions, gives them an editable starting-point
reply, and tracks what happens after they post it themselves. Built on the
existing Engine Framework and Event Bus; neither is modified by this
milestone.

## The hard guarantee

**Nothing in this module ever posts to an external platform.** There is no
function anywhere in `lib/growth/` that calls a social platform's posting
API. The workflow ends at `recordPublication(draftId, publishedUrl,
publishedBy)` (`lib/growth/approval.ts`), which only records that a human
already posted a reply themselves, at a URL they supply. "The system must
not automatically publish replies" is true because the code to do that
doesn't exist here -- it's not a setting that could be flipped.

## Pipeline

```
Opportunity -> Reply Suggested -> Reply Approved -> Reply Published ->
Website Visit -> Signup -> Trial -> Paid Customer
```

The first four stages are `Opportunity`/`DraftReply` status
(`registry.ts`, `approval.ts`); the last four are what
`lib/growth/tracking.ts` records (`recordConversion`).

## Modules

| Module | Responsibility |
|---|---|
| `types.ts` | The shared contract -- `Opportunity`, `DraftReply`, `PublishedEngagement`, `ClickEvent`, `ConversionEvent`. |
| `registry.ts` | Opportunity Registry. In-process (like `lib/engine/registry.ts`, `lib/urp/registry.ts`, `lib/webhooks/registry.ts` before it -- prove the mechanism before adding persistence). Dedupes by `(platform, threadId)` at ingestion -- Thread Memory. |
| `sources.ts` | `OpportunitySourceProvider` interface -- "keep platform integrations modular." `ManualOpportunitySource` is the one real implementation: a person records a discussion they found. No LinkedIn/X/Reddit/YouTube/Facebook/Quora API credentials exist anywhere in this app, so no source for any of them is implemented here -- see "what's deliberately not here." |
| `classification.ts` | Rule-based `classifyOpportunity` / `extractKeywords` / `scoreOpportunityPriority`. Deterministic and explainable -- not a call to an external AI classifier (none is configured in this app). |
| `duplicates.ts` / `textSimilarity.ts` | The three mandated duplicate-prevention mechanisms beyond Thread Memory: User Memory (`wasUserRecentlyEngaged`), a lexical-similarity heuristic (`textSimilarity` -- Jaccard token overlap, explicitly **not** called "semantic similarity," since true semantic similarity needs an embedding model this app doesn't have configured), and `getDuplicateWarnings` combining all of it into what a human reviews. |
| `replyAssistant.ts` | `ReplyAssistantProvider` interface; `TemplateReplyAssistant` is a rule-based, template draft generator -- not an LLM (no AI provider is configured anywhere in this app). Produces an honest, clearly-marked starting point ("[Draft -- edit before posting]") a human is expected to substantially rewrite. |
| `qualityScoring.ts` | `scoreReplyQuality` -- relevance, spam risk, duplicate risk, link appropriateness, tone/grammar, brand consistency. `QUALITY_THRESHOLD` (60) is enforced as a hard guard in `approval.ts`, not left to reviewer judgment alone. |
| `approval.ts` | The workflow: `submitDraftForReview` -> `approveDraft` / `rejectDraft` -> `recordPublication`. Publishes `growth.engagement-published` on the existing Event Bus once a human-recorded publication happens. |
| `tracking.ts` | UTM link building (reuses `lib/seo/metadata.ts`'s `SITE_URL`/`absoluteUrl`, not a second hardcoded domain), click recording, conversion recording, and funnel aggregation for the Admin Console. |
| `engine.ts` | Registers with the existing Engine Registry (`lib/engine/registry.ts`) via one added import line in `lib/engine/bootstrap.ts` -- the Engine Framework itself is untouched. |

## AI assistance, honestly scoped

The brief allows AI to summarize discussions, suggest reply drafts,
suggest whether a link is appropriate, and suggest relevant docs. This
milestone implements all four -- but with rule-based logic
(`TemplateReplyAssistant`, `classifyOpportunity`, `textSimilarity`), not a
live call to an LLM. **No AI/embedding provider is configured anywhere in
this codebase.** Building a "real AI assistant" here would mean
fabricating a call to a provider that doesn't exist, which this codebase's
established convention (see the Engine Framework and Webhook Engine
READMEs) explicitly avoids: defaults are honest, not fabricated. Every
provider interface (`ReplyAssistantProvider`, `OpportunitySourceProvider`)
is designed so a real, LLM- or platform-API-backed implementation can be
substituted later without changing any caller.

## Quality is scored before a draft can even be approved

`approveDraft` (`approval.ts`) throws if `draft.quality.overall` is below
`QUALITY_THRESHOLD` -- this is checked at approval time, not left as a
number a reviewer might ignore. Combined with the hard guarantee above (no
automatic publishing exists), a reply can only ever reach an external
platform if it scored above threshold **and** a human approved it **and**
a human posted it themselves.

## Admin Console

`app/control-center/growth/page.tsx` -- a new module (not one of the
originally-reserved Phase 2 placeholders, so it ships directly as
`available`). Read-only: Opportunity Queue, Draft Replies, Approval Queue,
Published Engagements, Click Analytics, Conversion Analytics, plus
Duplicate Replies Prevented / Spam-Risk Blocks / Top Platforms / Top
Keywords. No editing UI -- `submitDraftForReview`/`approveDraft`/
`rejectDraft`/`recordPublication`/`manualOpportunitySource.submit` are
real, tested functions available today for direct/administrative use or a
future UI, following the same "functions exist, admin mutation UI comes
later" pattern the Webhook Engine's `rotateSecret`/`updateEndpointStatus`
established.

## Click tracking

`app/api/growth/click/[opportunityId]/route.ts` is a real, working
redirect: `GET /api/growth/click/<id>?path=/solutions/...&campaign=...`
records a `ClickEvent` then 302-redirects. `path` must be site-relative
(reused via `absoluteUrl`) -- this deliberately cannot redirect to an
external URL, so it can't be used as an open redirect.

## What's deliberately not here

Per this milestone's explicit scope:

- **No real platform integrations.** No LinkedIn, X, Reddit, YouTube,
  Facebook, or Quora API client exists anywhere in this codebase. Adding
  one means implementing `OpportunitySourceProvider` for that platform,
  using that platform's official, permitted API -- a future, separate
  piece of work that needs its own ToS/compliance review before it ships.
- **No LLM-backed draft generation or classification.** No AI provider is
  configured in this app. `TemplateReplyAssistant` is the honest,
  real thing this milestone could build without one.
- **No automatic publishing**, anywhere, ever -- see "the hard guarantee"
  above. This is not a future item; it's a permanent boundary of this
  system's design.
- **No signup/trial/paid-customer event wiring.** No existing engine
  (Commercial included) publishes those events on the Event Bus today;
  `recordConversion` is the function a future integration calls once one
  does -- not claimed as already wired up.
- **No persistence** (opportunities, drafts, engagements, clicks,
  conversions are in-process, reset on cold start -- the same documented
  limitation as every other registry this session has built).
- **No editing/mutation UI** in the Admin Console.
