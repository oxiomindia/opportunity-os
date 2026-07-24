import type { Invoice } from '../../../types/invoice';

function isDueSoon(dueDate: string) {
  const today = new Date('2026-07-24T00:00:00Z');
  const due = new Date(`${dueDate}T00:00:00Z`);
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);

  return daysUntilDue >= 0 && daysUntilDue <= 7;
}

export default function InvoiceSummaryCards({ invoices }: Readonly<{ invoices: Invoice[] }>) {
  const cards = [
    {
      label: 'Total invoices',
      value: invoices.length.toString(),
      helper: 'Across the current worklist',
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Needs review',
      value: invoices.filter((invoice) => invoice.status === 'needs-review').length.toString(),
      helper: 'Require human validation',
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Due soon',
      value: invoices.filter((invoice) => isDueSoon(invoice.dueDate)).length.toString(),
      helper: 'Due within 7 days',
      tone: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Payment ready',
      value: invoices.filter((invoice) => invoice.status === 'payment-ready').length.toString(),
      helper: 'Ready for payment prep',
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
