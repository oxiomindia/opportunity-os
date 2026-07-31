import Link from 'next/link';

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

/** Shared empty-state pattern (icon, heading, description, optional CTA) --
 * originally InvoiceEmptyState.tsx's markup, generalized so every module
 * (customers, vendors, bills, reports, activity) gets the same visual
 * treatment instead of a plain line of text. */
export default function EmptyState({ icon, title, description, action }: Readonly<EmptyStateProps>) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action && (
        <Link href={action.href} className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          {action.label}
        </Link>
      )}
    </div>
  );
}
