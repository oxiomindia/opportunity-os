import Link from 'next/link';
import { CheckIcon } from './icons';

const proofPoints = ['Accounts Payable', 'Accounts Receivable', 'Finance Operations'];
const benefitChips = ['Automated approvals', 'Faster collections', 'Audit-ready', 'Real-time visibility'];

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 2xl:grid-cols-[1.04fr_.96fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-cyan-300">Oxiom - Finance Automation Platform</p>
          <h1 id="hero-title" className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            One platform for every financial workflow your business runs on
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            Oxiom brings Accounts Payable, Accounts Receivable, and Finance Operations into one connected workspace, with focused products your team can start using one at a time.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/trial"
              className="inline-flex items-center justify-center rounded-lg bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Request a Free 7-Day Trial
            </Link>
            <Link
              href="#products"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-200 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Explore Products
            </Link>
          </div>
          <ul className="mt-5 hidden flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300 sm:flex">
            {proofPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <CheckIcon size={16} className="text-emerald-300" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden rounded-[2rem] border border-white/10 bg-white/[.04] p-3 shadow-2xl 2xl:block">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Finance command view</p>
                <p className="mt-1 text-lg font-semibold text-white">Workflows in motion</p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/20">Live-ready</span>
            </div>
            <div className="mt-4 grid gap-2">
              {benefitChips.map((chip, index) => (
                <div key={chip} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-200/20">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{chip}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-emerald-400/20 p-3 text-sm leading-6 text-slate-200">
              Start with one finance workflow. Expand into the full Oxiom workspace when the team is ready.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
