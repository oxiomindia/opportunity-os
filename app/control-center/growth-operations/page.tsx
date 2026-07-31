import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { listLandingPages } from '../../../lib/growthOps/landingPageRegistry';
import { listContent } from '../../../lib/growthOps/contentRegistry';
import { listCampaigns, computeCampaignMetrics } from '../../../lib/growthOps/campaignTracking';

const statusTone: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-500',
  review: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
};

export default async function GrowthOperationsPage() {
  await requireControlCenterAccess();

  const landingPages = listLandingPages();
  const content = listContent();
  const campaigns = listCampaigns();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Growth Operations</h1>
      <p className="mt-2 text-sm text-slate-600">
        Landing pages, content, and campaign tracking (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">lib/growthOps/</code>).
        Read-only -- no editing UI in this milestone.
      </p>

      <Section title={`Landing Page Registry (${landingPages.length})`}>
        {landingPages.length === 0 ? (
          <EmptyState text="No landing pages registered yet." />
        ) : (
          <Table
            headers={['URL', 'Industry', 'Target Keyword', 'Status', 'Meta Title', 'Last Updated']}
            rows={landingPages.map((page) => [
              page.url,
              page.industry,
              page.targetKeyword,
              <span key="status" className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusTone[page.publishStatus]}`}>
                {page.publishStatus}
              </span>,
              page.metaTitle,
              page.lastUpdated,
            ])}
          />
        )}
      </Section>

      <Section title={`Content Registry (${content.length})`}>
        {content.length === 0 ? (
          <EmptyState text="No content registered yet." />
        ) : (
          <Table
            headers={['Type', 'Title', 'Status', 'Last Updated']}
            rows={content.map((entry) => [
              entry.type,
              entry.title,
              <span key="status" className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusTone[entry.status]}`}>
                {entry.status}
              </span>,
              entry.lastUpdated,
            ])}
          />
        )}
      </Section>

      <Section title={`Campaign Tracking (${campaigns.length})`}>
        {campaigns.length === 0 ? (
          <EmptyState text="No campaigns registered yet." />
        ) : (
          <Table
            headers={['Campaign', 'Source', 'Medium', 'UTM Campaign', 'Clicks', 'Leads', 'Trials', 'Customers']}
            rows={campaigns.map((campaign) => {
              const metrics = computeCampaignMetrics(campaign.utmCampaign);
              return [campaign.name, campaign.source, campaign.medium, campaign.utmCampaign, String(metrics.clicks), String(metrics.leads), String(metrics.trials), String(metrics.customers)];
            })}
          />
        )}
      </Section>
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
