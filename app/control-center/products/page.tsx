import { listProductsWithSettings } from '../../../lib/control-center/products';
import { requireControlCenterAccess } from '../../../lib/control-center/auth';
import { updateProductSettings } from './actions';

export default async function ControlCenterProductsPage() {
  await requireControlCenterAccess();
  const products = await listProductsWithSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Products</h1>
      <p className="mt-2 text-sm text-slate-600">
        Visibility and status shown here control the public pricing page only — the marketing site&apos;s product
        cards and detail pages still read from the code catalog.
      </p>

      <div className="mt-6 space-y-4">
        {products.map((product) => (
          <form
            key={product.productId}
            action={updateProductSettings}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <input type="hidden" name="productId" value={product.productId} />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{product.displayName}</p>
                <p className="text-xs text-slate-500">{product.slug}</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" name="visible" value="true" defaultChecked={product.visible} className="h-4 w-4 rounded border-slate-300" />
                Visible on pricing page
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Status override</span>
                <input
                  type="text"
                  name="statusOverride"
                  defaultValue={product.statusOverride ?? ''}
                  placeholder="Leave blank to use the catalog default"
                  maxLength={60}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">Badge label</span>
                <input
                  type="text"
                  name="badgeLabel"
                  defaultValue={product.badgeLabel ?? ''}
                  placeholder="e.g. Early Access Add-on"
                  maxLength={60}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Save
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
