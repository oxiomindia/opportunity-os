import Link from 'next/link';

import { BreadcrumbSchema } from '@/app/components/StructuredData';

import { getSolutionPage, solutionPages } from './solutionContent';

const icons = ['□', '○', '◎', '✓'];

export function SolutionPageTemplate({ slug }: { slug: string }) {
  const page = getSolutionPage(slug);
  const relatedPages = page.related.map((relatedSlug) => getSolutionPage(relatedSlug));

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://oxiom.in' },
          { name: 'Solutions', url: 'https://oxiom.in/solutions' },
          { name: page.pageName, url: `https://oxiom.in/solutions/${page.slug}` },
        ]}
      />
      <div className="min-h-screen bg-white">
        <div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Oxiom Solutions</p>
            <h1 className="mb-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{page.heading}</h1>
            <p className="max-w-3xl text-lg text-slate-600">{page.intro}</p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
          <section className="mb-16">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {page.valueProps.map((item, index) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="mb-4 text-2xl text-blue-700">{icons[index % icons.length]}</div>
                  <h2 className="mb-3 text-xl font-semibold text-slate-950">{item}</h2>
                  <p className="text-sm leading-6 text-slate-600">Oxiom helps finance teams operationalize {item.toLowerCase()} with configuration, accountability, and reporting built for enterprise workflows.</p>
                </div>
              ))}
            </div>
          </section>
          <section className="mb-16 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h2 className="mb-6 text-3xl font-semibold text-slate-950">Key capabilities</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {page.focus.map((item) => (
                  <div key={item} className="rounded-lg border border-slate-200 bg-white p-6">
                    <h3 className="mb-3 text-lg font-semibold text-slate-950">{item}</h3>
                    <p className="text-sm leading-6 text-slate-600">Use Oxiom to manage {item} with role-based workflow controls, audit history, and visibility for finance leaders, approvers, and IT stakeholders.</p>
                  </div>
                ))}
                {['search and filters', 'audit-ready history', 'exception visibility'].map((item) => (
                  <div key={item} className="rounded-lg border border-slate-200 bg-white p-6">
                    <h3 className="mb-3 text-lg font-semibold text-slate-950">{item}</h3>
                    <p className="text-sm leading-6 text-slate-600">Keep teams aligned with searchable records, governed status changes, and reporting that supports finance operations at scale.</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-6 text-3xl font-semibold text-slate-950">Use cases</h2>
              <div className="space-y-4">
                {page.useCases.map((useCase, index) => (
                  <div key={useCase} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Scenario {index + 1}</p>
                    <p className="text-sm leading-6 text-slate-600">{useCase}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
        <div className="border-y border-slate-100 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            <h2 className="mb-8 text-3xl font-semibold text-slate-950">Benefits</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                ['Lower processing effort', `Reduce manual touches across ${page.pageName.toLowerCase()} workflows.`],
                ['Faster turnaround', 'Move invoices through review, approval, and sending with fewer bottlenecks.'],
                ['Higher control confidence', 'Document every action with clear workflow status and audit history.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="mb-3 text-xl font-semibold text-slate-950">{title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <section>
              <h2 className="mb-6 text-3xl font-semibold text-slate-950">Related resources</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  ['/solutions', 'All solutions', 'Browse the full Oxiom solutions library.'],
                  ['/docs', 'Documentation', 'Review implementation and operational guidance.'],
                  ['/faq', 'FAQ', 'Get quick answers on rollout and platform usage.'],
                  ['/contact', 'Contact Oxiom', 'Talk with our team about your enterprise requirements.'],
                ].map(([href, title, description]) => (
                  <Link key={href} href={href} className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50">
                    <h3 className="mb-2 text-lg font-semibold text-slate-950">{title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{description}</p>
                  </Link>
                ))}
              </div>
            </section>
            <section>
              <h2 className="mb-6 text-3xl font-semibold text-slate-950">Related solution pages</h2>
              <div className="grid gap-6 md:grid-cols-1">
                {relatedPages.map((relatedPage) => (
                  <Link key={relatedPage.slug} href={`/solutions/${relatedPage.slug}`} className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50">
                    <h3 className="mb-2 text-lg font-semibold text-slate-950">{relatedPage.pageName}</h3>
                    <p className="text-sm leading-6 text-slate-600">{relatedPage.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-6 text-center sm:px-8 lg:px-10">
            <h2 className="mb-4 text-3xl font-semibold text-slate-950">Ready to transform your billing?</h2>
            <p className="mb-8 text-lg text-slate-600">See how Oxiom can help your team automate invoicing, approvals, controls, and reporting with an enterprise-ready billing platform.</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/contact" className="rounded-full bg-blue-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-700">Contact Oxiom</Link>
              <Link href="/dashboard" className="rounded-full border border-slate-300 px-7 py-3.5 text-base font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-950">View the product</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function SolutionsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {solutionPages.map((page) => (
        <Link key={page.slug} href={`/solutions/${page.slug}`} className="rounded-lg border border-slate-200 bg-white p-6 hover:border-blue-300 hover:bg-blue-50">
          <h3 className="mb-3 text-xl font-semibold text-slate-950">{page.pageName}</h3>
          <p className="text-sm leading-6 text-slate-600">{page.description}</p>
        </Link>
      ))}
    </div>
  );
}
