import Link from 'next/link';
import { QuoteIcon } from './icons';

export interface Testimonial {
  quote: string;
  authorName: string;
  authorRole: string;
  companyName: string;
}

const testimonials: Testimonial[] = [];

export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-title" className="bg-white py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {testimonials.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.authorName} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <QuoteIcon size={26} className="text-blue-200" />
                <blockquote className="mt-4 flex-1 text-sm leading-7 text-slate-700">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 border-t border-slate-100 pt-4 text-sm">
                  <p className="font-semibold text-slate-950">{testimonial.authorName}</p>
                  <p className="text-slate-500">{testimonial.authorRole}, {testimonial.companyName}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white sm:p-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-cyan-300">Customer stories</p>
              <h2 id="testimonials-title" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Built with early finance teams in mind
              </h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <QuoteIcon size={24} className="text-cyan-300" />
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Oxiom is early. Customer stories will be added as businesses go live, so this space stays honest instead of padded with invented proof.
              </p>
              <Link href="/trial" className="mt-4 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                Request a free trial
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
