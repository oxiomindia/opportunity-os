export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600">
          Opportunity OS
        </h1>

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 sm:px-8 lg:px-10">
      <a href="#top" className="text-xl font-semibold tracking-tight text-slate-950" aria-label="Oxiom home">
        Oxiom
      </a>
      <nav className="flex items-center gap-3" aria-label="Primary navigation">
        <a
          href="/dashboard"
          aria-label="Open dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-base font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700"
        >
          →
        </a>
        <a
          href="mailto:hello@oxiom.ai"
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Contact Us
        </a>
      </nav>
    </header>
  );
}
