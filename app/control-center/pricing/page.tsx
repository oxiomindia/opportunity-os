import { listProductsWithSettings, listPricingHistory, type PricingHistoryRow } from '../../../lib/control-center/products';
import { schedulePrice } from './actions';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function formatPaise(paise: number | null): string {
  if (paise == null) return '—';
  return currencyFormatter.format(paise / 100);
}

function rowLabel(row: PricingHistoryRow, now: Date): { text: string; tone: string } {
  const effective = new Date(row.effectiveFrom);
  if (effective > now) return { text: 'Scheduled', tone: 'bg-blue-100 text-blue-700' };
  return { text: 'Current or past', tone: 'bg-slate-100 text-slate-600' };
}

export default async function ControlCenterPricingPage() {
  const products = await listProductsWithSettings();
  const now = new Date();
  const productsWithHistory = await Promise.all(
    products.map(async (product) => ({ product, history: await listPricingHistory(product.productId) })),
  );

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Pricing</h1>
      <p className="mt-2 text-sm text-slate-600">
        Prices are effective-dated, not overwritten — scheduling a new price never changes what a customer already
        subscribed under. The current price is always the most recent row whose effective date has passed.
      </p>

      <div className="mt-8 space-y-8">
        {productsWithHistory.map(({ product, history }) => (
          <section key={product.productId} className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">{product.displayName}</h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-4">Plan</th>
                    <th className="pb-2 pr-4">Region</th>
                    <th className="pb-2 pr-4">Monthly</th>
                    <th className="pb-2 pr-4">Annual</th>
                    <th className="pb-2 pr-4">Effective from</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-xs text-slate-400">No price scheduled yet.</td>
                    </tr>
                  ) : (
                    history.map((row) => {
                      const label = rowLabel(row, now);
                      return (
                        <tr key={row.id} className="border-b border-slate-50">
                          <td className="py-2 pr-4">{row.planName}</td>
                          <td className="py-2 pr-4">{row.region}</td>
                          <td className="py-2 pr-4">{formatPaise(row.monthlyPricePaise)}</td>
                          <td className="py-2 pr-4">{formatPaise(row.annualPricePaise)}</td>
                          <td className="py-2 pr-4 text-xs text-slate-500">{new Date(row.effectiveFrom).toLocaleString('en-IN')}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${label.tone}`}>{label.text}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <form action={schedulePrice} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-5">
              <input type="hidden" name="productId" value={product.productId} />
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Monthly (INR)</span>
                <input type="number" name="monthlyPriceInr" min={0} step="1" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Annual (INR)</span>
                <input type="number" name="annualPriceInr" min={0} step="1" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Plan</span>
                <input type="text" name="planName" defaultValue="standard" maxLength={40} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Effective from</span>
                <input type="datetime-local" name="effectiveFrom" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <span className="mt-0.5 block text-[11px] text-slate-400">Leave blank for immediate</span>
              </label>
              <div className="flex items-end">
                <button type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                  Schedule price
                </button>
              </div>
              <input type="hidden" name="region" value="global" />
              <input type="hidden" name="currency" value="INR" />
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}
