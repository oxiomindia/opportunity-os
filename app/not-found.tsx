import Link from 'next/link';

export const metadata = {
  title: 'Page not found | Oxiom',
  robots: 'noindex, nofollow',
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Oxiom</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist, or may have moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Go to dashboard
          </Link>
          <Link href="/" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700">
            Go to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
