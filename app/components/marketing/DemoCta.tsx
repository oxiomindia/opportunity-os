import Link from 'next/link';

export default function DemoCta({
  title = 'See Oxiom in your finance workflow',
  description = 'Request a free 7-day trial and see how Oxiom fits your Accounts Payable, Accounts Receivable, and finance operations process.',
  href = '/trial',
  label = 'Request a Free 7-Day Trial',
}: Readonly<{ title?: string; description?: string; href?: string; label?: string }>) {
  return (
    <section aria-labelledby="demo-cta-title" className="bg-blue-700 py-16 text-white sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-cyan-200">Start with one workflow</p>
          <h2 id="demo-cta-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            href={href}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
          >
            {label}
          </Link>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
          >
            Talk to Sales
          </Link>
        </div>
      </div>
    </section>
  );
}
