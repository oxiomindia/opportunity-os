export interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection({
  heading = 'Frequently asked questions',
  items,
}: Readonly<{ heading?: string; items: FaqItem[] }>) {
  return (
    <section aria-labelledby="faq-title" className="border-t border-slate-200 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-10">
        <h2 id="faq-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{heading}</h2>
        <dl className="mt-10 space-y-8">
          {items.map((item) => (
            <div key={item.question}>
              <dt className="text-base font-semibold text-slate-950">{item.question}</dt>
              <dd className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
