import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import '../../../lib/engine/bootstrap';
import { listOpportunities } from '../../../lib/growth/registry';
import { listDrafts, listPublishedEngagements } from '../../../lib/growth/approval';
import { computeFunnelSummary, listClicks } from '../../../lib/growth/tracking';
import { QUALITY_THRESHOLD } from '../../../lib/growth/qualityScoring';
import type { DraftReply, OpportunityStatus } from '../../../lib/growth/types';

const opportunityStatusTone: Record<OpportunityStatus, string> = {
  new: 'bg-sky-100 text-sky-700',
  drafted: 'bg-amber-100 text-amber-700',
  approved: 'bg-violet-100 text-violet-700',
  published: 'bg-emerald-100 text-emerald-700',
  dismissed: 'bg-slate-100 text-slate-500',
};

const draftStatusTone: Record<DraftReply['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-violet-100 text-violet-700',
  rejected: 'bg-red-100 text-red-800',
  published: 'bg-emerald-100 text-emerald-700',
};

function topBy<T>(items: T[], key: (item: T) => string, limit: number): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = key(item);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default async function GrowthIntelligencePage() {
  await requireControlCenterAccess();

  const opportunities = listOpportunities();
  const drafts = listDrafts();
  const published = listPublishedEngagements();
  const clicks = listClicks();
  const funnel = computeFunnelSummary();

  const approvalQueue = drafts.filter((draft) => draft.status === 'pending');
  const duplicatesPrevented = drafts.filter((draft) => draft.duplicateWarnings.length > 0).length;
  const spamRiskBlocks = drafts.filter((draft) => draft.quality.overall < QUALITY_THRESHOLD).length;
  const topPlatforms = topBy(opportunities, (o) => o.platform, 5);
  const topKeywords = topBy(
    opportunities.flatMap((o) => o.keywords),
    (keyword) => keyword,
    8
  );

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Growth Intelligence</h1>
      <p className="mt-2 text-sm text-slate-600">
        Social listening and a human-review-first engagement workflow (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">lib/growth/</code>).
        Read-only -- no editing UI in this milestone. Nothing here ever posts to an external platform automatically.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Opportunities Found" value={opportunities.length} />
        <StatTile label="Draft Replies" value={drafts.length} />
        <StatTile label="Approval Queue" value={approvalQueue.length} />
        <StatTile label="Published Engagements" value={published.length} />
        <StatTile label="Duplicate Replies Prevented" value={duplicatesPrevented} />
        <StatTile label="Spam-Risk / Below-Threshold Blocks" value={spamRiskBlocks} />
        <StatTile label="Website Clicks" value={clicks.length} />
        <StatTile label="Trial Signups" value={funnel.trials} />
        <StatTile label="Paid Conversions" value={funnel.paidCustomers} />
      </div>

      <Section title={`Opportunity Queue (${opportunities.length})`}>
        {opportunities.length === 0 ? (
          <EmptyState text="No opportunities have been recorded yet." />
        ) : (
          <Table
            headers={['Platform', 'Category', 'Priority', 'Status', 'Snippet', 'Discovered']}
            rows={opportunities.map((opportunity) => [
              opportunity.platform,
              opportunity.category,
              String(opportunity.priorityScore),
              <span key="status" className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${opportunityStatusTone[opportunity.status]}`}>
                {opportunity.status}
              </span>,
              opportunity.snippet.length > 80 ? `${opportunity.snippet.slice(0, 80)}...` : opportunity.snippet,
              opportunity.discoveredAt,
            ])}
          />
        )}
      </Section>

      <Section title={`Approval Queue (${approvalQueue.length})`}>
        {approvalQueue.length === 0 ? (
          <EmptyState text="Nothing awaiting review." />
        ) : (
          <Table
            headers={['Draft', 'Quality Score', 'Duplicate Warnings', 'Includes Link', 'Created']}
            rows={approvalQueue.map((draft) => [
              draft.body.length > 80 ? `${draft.body.slice(0, 80)}...` : draft.body,
              String(draft.quality.overall),
              draft.duplicateWarnings.length > 0 ? draft.duplicateWarnings.map((warning) => warning.type).join(', ') : 'None',
              draft.includesLink ? 'Yes' : 'No',
              draft.createdAt,
            ])}
          />
        )}
      </Section>

      <Section title={`Draft Replies (${drafts.length})`}>
        {drafts.length === 0 ? (
          <EmptyState text="No drafts have been generated yet." />
        ) : (
          <Table
            headers={['Status', 'Quality Score', 'Generated By', 'Created']}
            rows={drafts.map((draft) => [
              <span key="status" className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${draftStatusTone[draft.status]}`}>
                {draft.status}
              </span>,
              String(draft.quality.overall),
              draft.generatedBy,
              draft.createdAt,
            ])}
          />
        )}
      </Section>

      <Section title={`Published Engagements (${published.length})`}>
        {published.length === 0 ? (
          <EmptyState text="No engagements have been published yet." />
        ) : (
          <Table
            headers={['Published URL', 'Published By', 'Published At']}
            rows={published.map((engagement) => [engagement.publishedUrl, engagement.publishedBy, engagement.publishedAt])}
          />
        )}
      </Section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title={`Click Analytics (${clicks.length})`}>
          {clicks.length === 0 ? (
            <EmptyState text="No tracked clicks yet." />
          ) : (
            <Table
              headers={['Destination', 'Campaign', 'Medium', 'Clicked At']}
              rows={clicks.map((click) => [click.destinationUrl, click.utmCampaign, click.utmMedium, click.clickedAt])}
            />
          )}
        </Section>

        <Section title="Conversion Analytics">
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <ConversionStat label="Website Visits" value={funnel.websiteVisits} />
            <ConversionStat label="Signups" value={funnel.signups} />
            <ConversionStat label="Trials" value={funnel.trials} />
            <ConversionStat label="Paid Customers" value={funnel.paidCustomers} />
          </dl>
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Top Performing Platforms">
          {topPlatforms.length === 0 ? <EmptyState text="No data yet." /> : <RankedList items={topPlatforms} />}
        </Section>
        <Section title="Top Keywords">
          {topKeywords.length === 0 ? <EmptyState text="No data yet." /> : <RankedList items={topKeywords} />}
        </Section>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-xs text-slate-500">{text}</p>;
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-slate-400">
          <tr>
            {headers.map((header) => (
              <th key={header} className="py-1 pr-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-1 pr-3 text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConversionStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function RankedList({ items }: { items: Array<{ label: string; count: number }> }) {
  return (
    <ol className="space-y-1 text-xs text-slate-600">
      {items.map((item) => (
        <li key={item.label} className="flex justify-between">
          <span>{item.label}</span>
          <span className="font-semibold text-slate-900">{item.count}</span>
        </li>
      ))}
    </ol>
  );
}
