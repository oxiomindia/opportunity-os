import { listCoupons, listPromotionOptions } from '../../../lib/control-center/coupons';
import { generateCoupon, setCouponEnabled } from './actions';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function ControlCenterCouponsPage() {
  const [coupons, promotionOptions] = await Promise.all([listCoupons(), listPromotionOptions()]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Coupons</h1>
      <p className="mt-2 text-sm text-slate-600">
        Every coupon is tied to a promotion and carries that promotion&apos;s discount — a coupon has no discount value of its own.
      </p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Generate coupon</h2>
        {promotionOptions.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">Create a promotion first — coupons must be associated with one.</p>
        ) : (
          <form action={generateCoupon} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-slate-600">Associated promotion</span>
              <select name="promotionId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                {promotionOptions.map((promotion) => (
                  <option key={promotion.id} value={promotion.id}>{promotion.headline}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Code (optional)</span>
              <input type="text" name="code" maxLength={40} placeholder="Auto-generated if left blank" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Usage limit (optional)</span>
              <input type="number" name="usageLimit" min={1} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Expires at (optional)</span>
              <input type="datetime-local" name="expiresAt" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <div className="flex items-end">
              <button type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                Generate coupon
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="mt-6 space-y-3">
        {coupons.length === 0 && <p className="text-sm text-slate-500">No coupons yet.</p>}
        {coupons.map((coupon) => (
          <article key={coupon.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm font-semibold text-slate-900">{coupon.code}</p>
                <p className="mt-1 text-xs text-slate-500">Promotion: {coupon.promotionHeadline}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Used {coupon.usageCount}{coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ''} · Expires {formatDate(coupon.expiresAt)}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${coupon.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {coupon.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <form action={setCouponEnabled}>
                <input type="hidden" name="couponId" value={coupon.id} />
                <input type="hidden" name="enabled" value={(!coupon.enabled).toString()} />
                <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  {coupon.enabled ? 'Disable' : 'Enable'}
                </button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
