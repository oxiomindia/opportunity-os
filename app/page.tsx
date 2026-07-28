import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, FileText } from './components/Icons';

export const metadata: Metadata = {
  title: 'Oxiom Invoice Software | Customer Invoicing & Billing Automation',
  description: 'Create and send customer invoices, track payment status, and manage billing from one workspace with Oxiom Invoice Software.',
};

const demoHref = 'mailto:oximindia@gmail.com?subject=Book%20an%20Oxiom%20Invoice%20Software%20Demo';

function DemoLink({ inverted = false }: Readonly<{ inverted?: boolean }>) {
  return <a href={demoHref} className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${inverted ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}><ExternalLink size={16} />Book Demo</a>;
}

export default function HomePage() {
  const workflow = [
    ['Add a customer', 'Set up the people and companies you bill in a secure organization workspace.'],
    ['Build an invoice', 'Pull line items from your product and service catalog, or add them manually.'],
    ['Send it', 'Review the invoice, then send it to your customer with one action.'],
    ['Track payment', 'Follow each invoice from sent to viewed to paid, and record payments as they arrive.'],
  ];
  const benefits = [
    ['Less manual entry', 'Build invoices from a reusable customer and product catalog instead of starting from scratch.'],
    ['Better visibility', 'Search, filter, and follow invoice status without relying on disconnected spreadsheets or inboxes.'],
    ['Fewer errors', 'Validate invoice details before they reach a customer.'],
    ['A clearer billing process', 'Give finance teams a consistent path from invoice creation to payment collection.'],
  ];

  return <div id="top" className="min-h-screen bg-white text-slate-950">
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-10">
        <a href="#top" className="rounded text-xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Oxiom</a>
        <nav aria-label="Primary navigation" className="flex items-center gap-3"><Link href="/login" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Login</Link><DemoLink /></nav>
      </div>
    </header>

    <main>
      <section aria-labelledby="hero-title" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-10 lg:py-32">
        <div><p className="text-sm font-semibold uppercase tracking-[.18em] text-blue-700">Oxiom One · Invoice Software</p><h1 id="hero-title" className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">A clearer way to bill your customers</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Oxiom Invoice Software gives finance teams one place to create invoices, send them to customers, and track payment status from draft to paid.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><DemoLink /><Link href="/login" className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Login</Link></div><p className="mt-5 text-sm text-slate-500">Designed for teams billing customers directly — create, send, and collect on your own invoices.</p></div>
        <aside aria-label="Product workflow summary" className="border-l-2 border-blue-600 pl-6 sm:pl-8"><FileText size={30} className="text-blue-700"/><h2 className="mt-5 text-xl font-semibold">From invoice creation to payment</h2><ol className="mt-6 space-y-5">{workflow.map(([title],index)=><li key={title} className="flex items-center gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">{index+1}</span><span className="font-medium">{title}</span></li>)}</ol></aside>
      </section>

      <section id="workflow" aria-labelledby="workflow-title" className="scroll-mt-6 border-y border-slate-200 bg-slate-50 py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="max-w-2xl"><p className="text-sm font-semibold text-blue-700">Product workflow</p><h2 id="workflow-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A simple, controlled billing process</h2><p className="mt-4 text-lg leading-8 text-slate-600">Keep each step understandable for the people responsible for billing and collections.</p></div><ol className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">{workflow.map(([title,description],index)=><li key={title} className="border-t border-slate-300 pt-5"><p className="text-sm font-semibold text-blue-700">0{index+1}</p><h3 className="mt-3 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></li>)}</ol></div></section>

      <section aria-labelledby="benefits-title" className="py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="max-w-2xl"><p className="text-sm font-semibold text-blue-700">Business value</p><h2 id="benefits-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Help finance teams work with greater clarity</h2></div><div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">{benefits.map(([title,description])=><article key={title}><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 max-w-xl leading-7 text-slate-600">{description}</p></article>)}</div></div></section>

      <section aria-labelledby="audience-title" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24"><div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10"><div><p className="text-sm font-semibold text-blue-700">Who it is for</p><h2 id="audience-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Built for teams that bill customers directly</h2></div><div className="space-y-7"><div><h3 className="font-semibold">Finance and billing teams</h3><p className="mt-2 leading-7 text-slate-600">Create and send invoices, review exceptions, and maintain visibility across every customer account.</p></div><div><h3 className="font-semibold">Finance managers and controllers</h3><p className="mt-2 leading-7 text-slate-600">Follow invoice status and support a more consistent billing and collections process.</p></div><div><h3 className="font-semibold">Growing organizations</h3><p className="mt-2 leading-7 text-slate-600">Move away from fragmented spreadsheet and document-based invoicing as customer volume increases.</p></div></div></div></section>

      <section id="security" aria-labelledby="security-title" className="scroll-mt-6 py-20 sm:py-24"><div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-10"><div><p className="text-sm font-semibold text-blue-700">Security and control</p><h2 id="security-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Keep invoice access within the right organization</h2></div><div className="grid gap-8 sm:grid-cols-2"><div><h3 className="font-semibold">Organization isolation</h3><p className="mt-2 leading-7 text-slate-600">Authenticated workspaces and tenant-aware access controls keep each organization&apos;s invoice records separate.</p></div><div><h3 className="font-semibold">Controlled document access</h3><p className="mt-2 leading-7 text-slate-600">Invoice documents use private storage and time-limited access links for review.</p></div><div><h3 className="font-semibold">Role-aware actions</h3><p className="mt-2 leading-7 text-slate-600">Workspace roles help control who can create, send, void, or delete invoice records.</p></div><div><h3 className="font-semibold">Operational history</h3><p className="mt-2 leading-7 text-slate-600">Status and audit records support review of important invoice actions.</p></div></div></div></section>

      <section aria-labelledby="cta-title" className="bg-blue-700 py-16 sm:py-20"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:items-center lg:px-10"><div className="max-w-2xl"><h2 id="cta-title" className="text-3xl font-semibold tracking-tight text-white">See Oxiom Invoice Software in your billing workflow</h2><p className="mt-3 text-lg leading-8 text-blue-100">Book a focused product demo to discuss your billing process and see the current workspace.</p></div><DemoLink inverted /></div></section>
    </main>

    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3 lg:px-10"><div><p className="font-semibold text-white">Oxiom</p><p className="mt-3 max-w-sm text-sm leading-6">Oxiom Invoice Software is part of Oxiom One, supporting customer invoicing and billing operations for finance teams.</p></div><nav aria-label="Product links"><p className="font-semibold text-white">Product</p><ul className="mt-3 space-y-2 text-sm"><li><a href="#workflow" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Workflow</a></li><li><a href="#security" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Security and control</a></li><li><Link href="/login" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Login</Link></li></ul></nav><nav aria-label="Company links"><p className="font-semibold text-white">Talk to Oxiom</p><ul className="mt-3 space-y-2 text-sm"><li><a href={demoHref} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Book Demo</a></li><li><a href="mailto:oximindia@gmail.com" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">oximindia@gmail.com</a></li></ul></nav></div><div className="border-t border-slate-800 px-5 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} Oxiom. All rights reserved.</div></footer>
  </div>;
}
