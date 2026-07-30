import { getCommercialSettings } from '../../../lib/control-center/settings';
import { updateCommercialSettings } from './actions';

export default async function ControlCenterSettingsPage() {
  const settings = await getCommercialSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Settings</h1>
      <p className="mt-2 text-sm text-slate-600">
        Single source of truth for Oxiom&apos;s business, payment, and trial defaults — the payment collection
        links elsewhere in the Control Center read live from these values.
      </p>

      <form action={updateCommercialSettings} className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-slate-600">Business name</span>
          <input type="text" name="businessName" defaultValue={settings.businessName ?? ''} maxLength={200} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Support email</span>
          <input type="email" name="supportEmail" defaultValue={settings.supportEmail ?? ''} maxLength={200} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Support phone</span>
          <input type="text" name="supportPhone" defaultValue={settings.supportPhone ?? ''} maxLength={40} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">WhatsApp number</span>
          <input type="text" name="whatsappNumber" defaultValue={settings.whatsappNumber ?? ''} maxLength={40} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">UPI ID</span>
          <input type="text" name="upiId" defaultValue={settings.upiId ?? ''} maxLength={100} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-slate-600">Payee name</span>
          <input type="text" name="payeeName" defaultValue={settings.payeeName ?? ''} maxLength={200} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Brand color</span>
          <input type="text" name="brandColor" defaultValue={settings.brandColor ?? ''} placeholder="#2563eb" maxLength={20} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Default trial duration (days)</span>
          <input type="number" name="defaultTrialDurationDays" defaultValue={settings.defaultTrialDurationDays} min={1} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Currency</span>
          <input type="text" name="currency" defaultValue={settings.currency} maxLength={3} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Timezone</span>
          <input type="text" name="timezone" defaultValue={settings.timezone} maxLength={60} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
