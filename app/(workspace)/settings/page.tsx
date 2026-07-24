const automationSettings = [
  { label: 'AI extraction', value: 'Enabled', description: 'Extract invoice header, tax, totals, and vendor fields on intake.' },
  { label: 'Duplicate detection', value: 'Strict', description: 'Match vendor, invoice number, amount, and due date before payment release.' },
  { label: 'Controller approval threshold', value: '$25,000', description: 'Route high-value invoices for additional accounts review.' },
  { label: 'Payment export format', value: 'Treasury CSV', description: 'Prepare approved invoices for downstream bank upload workflows.' },
];

const notificationSettings = [
  'Alert owners when confidence is below 75%.',
  'Notify accounts review when critical exceptions are detected.',
  'Send payment operations a daily ready-to-pay digest.',
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Workspace configuration</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Review the operational controls that govern Oxiom intake automation, exception routing, approvals, exports, and notifications.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Automation controls</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {automationSettings.map((setting) => (
              <article key={setting.label} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-start first:pt-0 last:pb-0">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">{setting.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{setting.description}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{setting.value}</span>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">Notification rules</h2>
          <ul className="mt-4 space-y-3">
            {notificationSettings.map((setting) => (
              <li key={setting} className="flex gap-3 text-sm leading-6 text-slate-600">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                {setting}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
