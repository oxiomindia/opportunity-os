const salesEmail = 'oximindia@gmail.com';

export default function ContactSales() {
  return (
    <section aria-labelledby="contact-sales-title" className="border-t border-slate-200 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-12 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-700">Talk to sales</p>
            <h2 id="contact-sales-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Have questions before you book a demo?
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Tell us about your finance team and what you&apos;re trying to solve — Accounts Payable, Accounts Receivable, or the full Finance Suite. We&apos;ll point you to the right product.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <a
              href={`mailto:${salesEmail}`}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Email Sales
            </a>
            <p className="text-sm text-slate-500">{salesEmail}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
