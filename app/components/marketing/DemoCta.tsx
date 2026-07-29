import Link from 'next/link';

export default function DemoCta({
  title = 'See Oxiom in your finance workflow',
  description = 'Book a focused walkthrough with our team to see how Oxiom fits your Accounts Payable and Accounts Receivable process.',
  href = '/book-demo',
  label = 'Book a Demo',
}: Readonly<{ title?: string; description?: string; href?: string; label?: string }>) {
  return (
    <section aria-labelledby="demo-cta-title" className="bg-blue-700 py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:items-center lg:px-10">
        <div className="max-w-2xl">
          <h2 id="demo-cta-title" className="text-3xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-3 text-lg leading-8 text-blue-100">{description}</p>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
