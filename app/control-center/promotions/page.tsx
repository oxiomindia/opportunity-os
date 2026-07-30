import { listPromotions } from '../../../lib/control-center/promotions';
import { createPromotion, activatePromotion, deactivatePromotion } from './actions';

function formatDiscount(promotion: Awaited<ReturnType<typeof listPromotions>>[number]): string {
  if (promotion.discountType === 'percentage' && promotion.discountPercent !== null) return `${promotion.discountPercent}% off`;
  if (promotion.discountType === 'fixed' && promotion.discountAmountPaise !== null) {
    return `${new Intl.NumberFormat('en-IN', { style: 'currency', currency: promotion.currency }).format(promotion.discountAmountPaise / 100)} off`;
  }
  return 'No structured discount';
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function ControlCenterPromotionsPage() {
  const promotions = await listPromotions();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Promotions</h1>
      <p className="mt-2 text-sm text-slate-600">
        Only one promotion can be active at a time. Activating a promotion automatically deactivates any other active one.
      </p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Create promotion</h2>
        <form action={createPromotion} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Headline</span>
            <input type="text" name="headline" required maxLength={200} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Description</span>
            <input type="text" name="description" maxLength={500} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Discount type</span>
            <select name="discountType" required defaultValue="percentage" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Currency</span>
            <input type="text" name="currency" defaultValue="INR" maxLength={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Discount percent (if percentage)</span>
            <input type="number" name="discountPercent" min={1} max={100} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Discount amount, INR (if fixed)</span>
            <input type="number" name="discountAmountInr" min={0} step="1" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Starts at</span>
            <input type="datetime-local" name="startsAt" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Ends at</span>
            <input type="datetime-local" name="endsAt" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              Create promotion
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 space-y-3">
        {promotions.length === 0 && <p className="text-sm text-slate-500">No promotions yet.</p>}
        {promotions.map((promotion) => (
          <article key={promotion.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{promotion.headline}</p>
                {promotion.description && <p className="mt-1 text-xs text-slate-500">{promotion.description}</p>}
                <p className="mt-2 text-xs text-slate-600">
                  {formatDiscount(promotion)} · {formatDate(promotion.startsAt)} – {formatDate(promotion.endsAt)}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${promotion.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {promotion.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              {promotion.active ? (
                <form action={deactivatePromotion}>
                  <input type="hidden" name="promotionId" value={promotion.id} />
                  <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Deactivate
                  </button>
                </form>
              ) : (
                <form action={activatePromotion}>
                  <input type="hidden" name="promotionId" value={promotion.id} />
                  <button type="submit" className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
                    Activate
                  </button>
                </form>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
