import { industries } from '../../../lib/industries/catalog';

export default function Industries() {
  return (
    <section id="industries" aria-labelledby="industries-title" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-700">Industries we serve</p>
          <h2 id="industries-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Built for finance teams across industries
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Oxiom fits how your business is billed, invoiced, and reconciled — whatever industry you operate in.
          </p>
        </div>
        <ul className="mt-10 flex flex-wrap gap-3">
          {industries.map((industry) => (
            <li key={industry.id} className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700">
              {industry.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
