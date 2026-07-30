import { QuoteIcon } from './icons';

export interface Testimonial {
  quote: string;
  authorName: string;
  authorRole: string;
  companyName: string;
}

/**
 * Empty today by design — Oxiom has no published customer testimonials
 * yet. The component and layout are ready to render real quotes the
 * moment they exist; until then it shows an honest placeholder instead
 * of fabricated social proof.
 */
const testimonials: Testimonial[] = [];

export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-title" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-700">Customer stories</p>
          <h2 id="testimonials-title" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Trusted by finance teams as they grow
          </h2>
        </div>

        {testimonials.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.authorName} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <QuoteIcon size={26} className="text-blue-200" />
                <blockquote className="mt-4 flex-1 text-sm leading-7 text-slate-700">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-5 border-t border-slate-100 pt-4 text-sm">
                  <p className="font-semibold text-slate-950">{testimonial.authorName}</p>
                  <p className="text-slate-500">{testimonial.authorRole}, {testimonial.companyName}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <QuoteIcon size={26} className="mx-auto text-slate-300" />
            <p className="mt-4 text-sm leading-6 text-slate-600">
              We&apos;re early — customer stories will appear here as businesses go live on Oxiom.{' '}
              <a href="/trial" className="font-semibold text-blue-700 hover:text-blue-800">Request a free trial</a> to be one of the first.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
