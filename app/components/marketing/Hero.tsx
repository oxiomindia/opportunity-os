import Link from 'next/link';
import { CheckIcon } from './icons';

const proofPoints = ['Multi-tenant workspace security', 'Built for growing finance teams', 'One platform, multiple products'];

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="border-b border-slate-200 bg-gradient-to-b from-blue-50/60 to-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-blue-700">Oxiom · Finance Automation Platform</p>
          <h1 id="hero-title" className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            One platform for every financial workflow your business runs on
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Oxiom brings Accounts Payable, Accounts Receivable, and the tools finance teams need to run them — as one connected platform, or as focused, standalone products.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/trial"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Request a Free 7-Day Trial
            </Link>
            <Link
              href="/platform"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Explore Products
            </Link>
          </div>
          <ul className="mt-10 flex flex-col items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-600 sm:flex-row">
            {proofPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <CheckIcon size={16} className="text-blue-600" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
