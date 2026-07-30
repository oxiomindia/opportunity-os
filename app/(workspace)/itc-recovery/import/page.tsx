import Link from 'next/link';
import { importItcReturnRecords } from '../actions';

export const metadata = {
  title: 'Import Return Records | ITC Recovery | Oxiom',
};

const templateHeader = 'Vendor GSTIN,Vendor Name,Return Invoice Number,Invoice Date,Return Period,Taxable Value,Tax Amount,Currency';
const templateExample = '27AAECM1234F1Z5,Meridian Office Supplies Pvt Ltd,MO-8841,2026-07-02,2026-07,42000,7560,INR';

export default async function ImportItcReturnRecordsPage({ searchParams }: Readonly<{ searchParams: Promise<{ error?: string }> }>) {
  const { error } = await searchParams;
  const errorMessage = {
    invalid: 'Please choose a CSV file to upload.',
    'too-large': 'That file is too large — please split it into smaller return-period batches.',
    empty: 'No valid rows were found in that file. Check it matches the template below.',
    mutation: 'Something went wrong importing that file.',
  }[error ?? ''];

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/itc-recovery" className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline">
        ← Back to ITC Recovery
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-950">Import return records</h1>
      <p className="mt-1 text-sm text-slate-600">
        Upload a CSV of your filed GST return (GSTR-2A/2B) lines using the Oxiom template below. Rows that already exist (same vendor GSTIN and invoice number) are skipped automatically.
      </p>

      {errorMessage && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">CSV template</h2>
        <p className="mt-1 text-xs text-slate-500">Column order doesn&apos;t matter as long as the header names match. Currency is optional and defaults to INR.</p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
{templateHeader}
{'\n'}
{templateExample}
        </pre>
      </section>

      <form action={importItcReturnRecords} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">CSV file</span>
          <input name="file" type="file" accept=".csv,text/csv" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <div>
          <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Import
          </button>
        </div>
      </form>
    </div>
  );
}
