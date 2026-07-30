# Universal Report Platform (URP)

The single reporting platform for Oxiom. Every future report, export, or
generated document is meant to flow through this contract eventually --
this milestone builds the contract, the registry, the generation pipeline,
and wires one real report (ITC Reconciliation) through it end to end. It
does not rewrite any existing business module, and it does not touch the
Webhook Engine (which consumes URP's events later).

## Why this exists

The Engine Framework (`lib/engine/`) and Event Bus (`lib/events/`) are
stable platform foundations this milestone builds on top of, unmodified.
Before this milestone, ITC Recovery had two independent, hand-written
export routes (CSV and PDF) with no shared contract, no JSON/Markdown/HTML
support, and no way for a future engine to add a report without inventing
its own export mechanism from scratch. URP is that shared contract.

## The report contract

Every report is a `ReportDefinition<TInput, TData>` (`lib/urp/types.ts`):

| Concept | Where it lives |
|---|---|
| Report ID, Name, Description, Version, Category, Source Engine | `metadata` (a `ReportMetadata`) |
| Input Schema | `metadata.inputSchema` (declarative description) + `validateInput()` (the real runtime check) |
| Output Formats | Derived from `Object.keys(templates)` -- never separately declared, so it can't drift from what's actually implemented |
| Template (per format) | `templates: Partial<Record<OutputFormat, ReportTemplate<TData>>>` |
| Metadata (delivery) | `RenderedReport.contentType` / `.filename` per generated output |

`TInput` is what a caller supplies (e.g. `{ period? }`); `TData` is what
`loadData(input)` produces and every template renders from -- one data
fetch, many output formats, so a PDF and a CSV of the same report can never
show different numbers (same principle `getItcReconciliationReport()`
already established for the dashboard vs. its exports).

## Supported outputs

`html` | `pdf` | `markdown` | `json` | `csv` (`OutputFormat` in
`lib/urp/types.ts`). A report only implements the formats that make sense
for it -- `templates` is `Partial`. Adding a future format platform-wide
means adding one member to the `OutputFormat` union; no report registry or
pipeline code changes.

## Report Registry

`lib/urp/registry.ts` mirrors `lib/engine/registry.ts`:

- `registerReport(definition)` -- self-registration; throws on a duplicate
  id or a report with zero templates.
- `listReports()` / `getRegisteredReport(id)` -- read-only discovery
  (`RegisteredReport`: metadata, supported formats, status). What the Admin
  Console renders.
- `getReportDefinition(id)` -- internal, used only by the generation
  pipeline; exposes the actual validate/load/render functions.
- `getSupportedFormats(id)` -- capability/format lookup.

Self-registration, not central enumeration: `lib/urp/bootstrap.ts` is the
only file that imports report modules by name (one line per report,
exactly like `lib/engine/bootstrap.ts`).

## Generation pipeline

`generateReport(request)` (`lib/urp/generate.ts`) is the standard pipeline
every report goes through:

```
Structured Input -> Validation -> Template Selection -> Rendering -> Output Generation -> Result
```

1. **Structured Input** -- `request.input` (deliberately `unknown` at this
   boundary; see the type's own doc comment for why a generic here would be
   a false promise).
2. **Template Selection** -- look up the report and the requested format's
   template; a missing report or unsupported format fails fast with the
   list of formats that _are_ supported.
3. **Validation** -- `definition.validateInput(input)`.
4. **Rendering** -- `definition.loadData(validation.data)`.
5. **Output Generation** -- `template.render(data)`.
6. **Result** -- `GenerateReportResult`: `{ ok: true, report, version, ... }`
   or `{ ok: false, error, ... }`. Never throws for an expected failure
   (unregistered report, unsupported format, invalid input, a render
   throwing) -- all of those are values, not exceptions.

## Event Bus integration

`generateReport()` publishes on the existing Event Bus (`lib/events/bus.ts`,
not a second event mechanism):

- `report.requested` -- published immediately, before the report is even
  looked up, so a request for an unregistered report is still observable.
- `report.generated` -- on success, with the format and output filename.
- `report.failed` -- on any failure (unregistered report, unsupported
  format, invalid input, a render exception), with the error message.

Every event's `sourceEngine` is the report's declared `metadata.sourceEngine`
(or `'urp'` itself when the report couldn't be looked up at all).

## The first real report: ITC Reconciliation

`lib/itcRecovery/urpReport.ts` registers `itc-reconciliation`, reusing the
existing `getItcReconciliationReport()` (data), `renderItcReconciliationPdfBuffer()`
(PDF), and `buildItcReconciliationCsv()` (CSV) exactly as they already
existed -- no rendering logic duplicated. JSON, Markdown, and HTML are new
(ITC Recovery had no such export before), built from the same report data
and the same shared formatters (`lib/itcRecoveryFormatters.ts`) the
existing renderers use, so wording and numbers can't drift between formats.

The existing dedicated routes, `/api/itc-recovery/export/csv` and
`/api/itc-recovery/export/pdf`, are untouched and keep working exactly as
before. `/api/urp/reports/[reportId]` (`app/api/urp/reports/[reportId]/route.ts`)
is a new, generic, additive route that generates any registered report in
any of its supported formats via `generateReport()` -- e.g.
`/api/urp/reports/itc-reconciliation?format=json&period=2026-01` -- proving
the pipeline against the real report rather than only a fixture in a test.

## Admin Console

`app/control-center/reports-platform/page.tsx` -- the reserved "Universal
Report Platform" placeholder, now implemented read-only: registered
reports, source engine, version, supported formats, status. No editing UI
in this milestone.

## What's deliberately not here

Per this milestone's explicit scope: no Webhook Engine (it consumes URP's
`report.*` events later), no persistent report/run history, no scheduling,
no report editing UI, no changes to the Engine Framework or Event Bus
contracts. The platform architecture review's roadmap explains the
intended build order.
