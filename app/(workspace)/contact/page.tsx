import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Oxiom | Support & Sales',
  description: 'Get in touch with the Oxiom team. Contact sales, support, or partnerships.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Contact Us
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Get in touch with the Oxiom team. We're here to help.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Contact Methods */}
          <div>
            <h2 className="mb-8 text-2xl font-semibold text-slate-950">Contact Methods</h2>
            <div className="space-y-8">
              <div>
                <h3 className="mb-2 font-semibold text-slate-950">Email</h3>
                <p className="text-slate-600">hello@oxiom.ai</p>
                <p className="text-sm text-slate-500 mt-1">General inquiries</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-950">Sales</h3>
                <p className="text-slate-600">sales@oxiom.ai</p>
                <p className="text-sm text-slate-500 mt-1">Product demos and pricing</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-950">Support</h3>
                <p className="text-slate-600">support@oxiom.ai</p>
                <p className="text-sm text-slate-500 mt-1">Technical assistance</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-950">Security</h3>
                <p className="text-slate-600">security@oxiom.ai</p>
                <p className="text-sm text-slate-500 mt-1">Security disclosures</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-950">Compliance</h3>
                <p className="text-slate-600">compliance@oxiom.ai</p>
                <p className="text-sm text-slate-500 mt-1">Compliance and legal</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-950">Phone</h3>
                <p className="text-slate-600">+1 (555) 014-9028</p>
                <p className="text-sm text-slate-500 mt-1">Business hours EST</p>
              </div>
            </div>
          </div>

          {/* Office & Socials */}
          <div>
            <h2 className="mb-8 text-2xl font-semibold text-slate-950">Connect With Us</h2>
            <div className="space-y-8">
              <div>
                <h3 className="mb-2 font-semibold text-slate-950">Office</h3>
                <p className="text-slate-600">Oxiom, Inc.</p>
                <p className="text-slate-600">United States</p>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-slate-950">Social Media</h3>
                <div className="space-y-2">
                  <a
                    href="https://www.linkedin.com/company/oxiom"
                    className="block text-blue-600 hover:text-blue-700"
                  >
                    → LinkedIn
                  </a>
                  <a
                    href="https://x.com/oxiom"
                    className="block text-blue-600 hover:text-blue-700"
                  >
                    → X (Twitter)
                  </a>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-950">Response Time</h3>
                <p className="text-slate-600">We typically respond to inquiries within 24 business hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Hours */}
      <div className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-semibold text-slate-950">Support Availability</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-2 font-semibold text-slate-950">Email & Chat</h3>
              <p className="text-slate-600">24/7 availability</p>
              <p className="text-sm text-slate-500 mt-2">Responses within 24 hours</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-2 font-semibold text-slate-950">Phone</h3>
              <p className="text-slate-600">Monday - Friday, 9 AM - 5 PM EST</p>
              <p className="text-sm text-slate-500 mt-2">Enterprise support available 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
