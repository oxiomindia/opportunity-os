import type { Invoice } from '../../../types/invoice';

export default function InvoiceSummaryCards({ invoices }: Readonly<{ invoices: Invoice[] }>) {
  const cards = [
    {
      label: 'Total invoices',
      value: invoices.length.toString(),
      helper: 'Across the current worklist',
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Drafts',
      value: invoices.filter((invoice) => invoice.status === 'draft').length.toString(),
      helper: 'Not yet sent to a customer',
      tone: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Overdue',
      value: invoices.filter((invoice) => invoice.status === 'overdue').length.toString(),
      helper: 'Past their due date',
      tone: 'bg-red-50 text-red-700',
    },
    {
      label: 'Paid',
      value: invoices.filter((invoice) => invoice.status === 'paid').length.toString(),
      helper: 'Fully collected',
      tone: 'bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <section aria-labelledby="invoice-summary-title" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <h2 id="invoice-summary-title" className="sr-only">
        Invoice summary
      </h2>
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
            </div>
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${card.tone}`} aria-hidden="true">
              □
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}
