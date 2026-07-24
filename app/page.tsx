const footerLinks = [
  { label: 'Email', value: 'hello@oxiom.ai', href: 'mailto:hello@oxiom.ai' },
  { label: 'Phone', value: '+1 (555) 014-9028', href: 'tel:+15550149028' },
  { label: 'LinkedIn', value: 'LinkedIn', href: 'https://www.linkedin.com/company/oxiom' },
  { label: 'X (Twitter)', value: 'X (Twitter)', href: 'https://x.com/oxiom' },
];

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 sm:px-8 lg:px-10">
      <a href="#top" className="rounded-md text-xl font-semibold tracking-tight text-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Oxiom home">
        Oxiom
      </a>
      <nav className="flex items-center gap-3" aria-label="Primary navigation">
        <a
          href="/dashboard"
          aria-label="Open dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-base font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          →
        </a>
        <a
          href="mailto:hello@oxiom.ai"
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Contact Us
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <main id="top" className="mx-auto flex min-h-[calc(100vh-220px)] w-full max-w-6xl items-center px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
      <section className="max-w-3xl">
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Oxiom</p>
        <h1 className="text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
          AI-Powered Invoice Processing
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-600 sm:text-2xl sm:leading-9">
          Transform vendor invoices into verified, payment-ready data in minutes.
        </p>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <a
            href="/dashboard"
            aria-label="Open dashboard"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-xl font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            →
          </a>
          <a
            href="mailto:hello@oxiom.ai"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 text-sm text-slate-500 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="font-semibold text-slate-900">Oxiom</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            {footerLinks.map((link) => (
              <a key={link.label} href={link.href} className="rounded focus-visible:ring-2 focus-visible:ring-blue-500 hover:text-blue-700">
                <span className="sr-only">{link.label}: </span>
                {link.value}
              </a>
            ))}
          </div>
        </div>
        <p>© {new Date().getFullYear()} Oxiom. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
