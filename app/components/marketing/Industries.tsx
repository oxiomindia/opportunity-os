import { industries } from '../../../lib/industries/catalog';

export default function Industries() {
  return (
    <section id="industries" aria-labelledby="industries-title" className="scroll-mt-24 bg-amber-50/50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-amber-700">Industries we serve</p>
            <h2 id="industries-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Built for finance teams across industries
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Oxiom fits how your business is billed, invoiced, approved, and reconciled - without inventing a separate promise for every industry.
          </p>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry, index) => (
            <li key={industry.id} className="group rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition-colors hover:border-amber-200 hover:bg-amber-50">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-950">{industry.label}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
