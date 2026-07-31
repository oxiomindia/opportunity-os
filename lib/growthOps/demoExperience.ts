import { mockCustomers } from '../../data/mockCustomers';
import { mockVendors } from '../../data/mockVendors';
import { mockProductsServices } from '../../data/mockProductsServices';
import { mockInvoices } from '../../data/mockInvoices';
import { mockInvoiceLineItems } from '../../data/mockInvoiceLineItems';
import { mockVendorInvoices } from '../../data/mockVendorInvoices';
import { mockVendorInvoiceLineItems } from '../../data/mockVendorInvoiceLineItems';
import { mockActivityEvents } from '../../data/mockActivity';
import { mockItcPurchaseRecords } from '../../data/mockItcPurchaseRecords';
import { mockItcReturnRecords } from '../../data/mockItcReturnRecords';
import { reconcileItcRecords } from '../itcRecovery/reconciliation';
import { vendorInvoiceStatuses } from '../../types/vendorInvoice';
import type { InvoiceStatus } from '../../types/invoice';

/**
 * Verifies the demo dataset (data/mock*.ts) is present and internally
 * consistent for each area the Demo Experience milestone lists --
 * Dashboard, Customers, Vendors, Products, Invoices, Bills, Reports, GST,
 * Search, Filters. This checks DATA ADEQUACY from server-side code (the
 * mock arrays are well-formed, non-empty, and arithmetically consistent);
 * it is not a substitute for an actual browser rendering the pages --
 * that verification happened separately, against a running local
 * production server, during this milestone's own validation (see
 * lib/growthOps/README.md).
 */

export type CheckStatus = 'pass' | 'fail';

export interface DemoExperienceCheck {
  area: string;
  status: CheckStatus;
  detail: string;
}

function check(area: string, condition: boolean, detail: string): DemoExperienceCheck {
  return { area, status: condition ? 'pass' : 'fail', detail };
}

function approxEqual(a: number, b: number, tolerance = 0.5): boolean {
  return Math.abs(a - b) <= tolerance;
}

export function runDemoExperienceChecks(): DemoExperienceCheck[] {
  const checks: DemoExperienceCheck[] = [];

  checks.push(check('Dashboard', mockInvoices.length > 0 && mockActivityEvents.length > 0, `${mockInvoices.length} invoices and ${mockActivityEvents.length} activity events feed the dashboard.`));

  checks.push(check('Customers', mockCustomers.length >= 10 && mockCustomers.every((customer) => customer.name.length > 0), `${mockCustomers.length} demo customers across distinct industries.`));

  checks.push(check('Vendors', mockVendors.length >= 8 && mockVendors.every((vendor) => vendor.name.length > 0), `${mockVendors.length} demo vendors.`));

  checks.push(check('Products', mockProductsServices.length >= 8 && mockProductsServices.every((product) => product.unitPrice > 0), `${mockProductsServices.length} demo products/services.`));

  const invoicesWithConsistentLineItems = mockInvoices.every((invoice) => {
    const items = mockInvoiceLineItems[invoice.id] ?? [];
    if (items.length === 0) return false;
    const sum = items.reduce((total, item) => total + item.lineTotal, 0);
    return approxEqual(sum, invoice.subtotal);
  });
  const uniqueInvoiceNumbers = new Set(mockInvoices.map((invoice) => invoice.invoiceNumber)).size === mockInvoices.length;
  checks.push(
    check(
      'Invoices',
      mockInvoices.length === 25 && uniqueInvoiceNumbers && invoicesWithConsistentLineItems,
      `${mockInvoices.length} invoices, unique numbers: ${uniqueInvoiceNumbers}, line items sum to subtotal for every invoice: ${invoicesWithConsistentLineItems}.`
    )
  );

  const billStatusesRepresented = new Set(mockVendorInvoices.map((bill) => bill.status));
  const allBillStatusesCovered = vendorInvoiceStatuses.every((status) => billStatusesRepresented.has(status));
  const billsWithLineItems = mockVendorInvoices.every((bill) => (mockVendorInvoiceLineItems[bill.id] ?? []).length > 0);
  checks.push(
    check(
      'Bills',
      mockVendorInvoices.length >= 9 && allBillStatusesCovered && billsWithLineItems,
      `${mockVendorInvoices.length} bills, every status represented: ${allBillStatusesCovered}, every bill has line items: ${billsWithLineItems}.`
    )
  );

  const invoiceStatusesPresent = new Set(mockInvoices.map((invoice) => invoice.status));
  const reportingStatuses: InvoiceStatus[] = ['paid', 'overdue', 'partially-paid'];
  const reportingStatusesCovered = reportingStatuses.every((status) => invoiceStatusesPresent.has(status));
  checks.push(check('Reports', reportingStatusesCovered, `Paid/overdue/partially-paid all represented for reporting: ${reportingStatusesCovered}.`));

  let gstCheck: DemoExperienceCheck;
  try {
    // Matches the exact filter getItcReconciliationReport() (lib/itcRecovery/report.ts)
    // applies in production: ITC/GST is an India-specific, INR-only concern.
    const rows = reconcileItcRecords(mockItcPurchaseRecords.filter((record) => record.currency === 'INR'), mockItcReturnRecords);
    const statuses = new Set(rows.map((row) => row.status));
    gstCheck = check('GST', rows.length > 0 && statuses.size > 1, `ITC reconciliation produced ${rows.length} rows across ${statuses.size} distinct statuses using the real reconciliation logic.`);
  } catch (error) {
    gstCheck = check('GST', false, `Reconciliation threw: ${error instanceof Error ? error.message : String(error)}`);
  }
  checks.push(gstCheck);

  const distinctCustomerNames = new Set(mockInvoices.map((invoice) => invoice.customerName)).size;
  checks.push(check('Search', distinctCustomerNames >= 5, `${distinctCustomerNames} distinct customer names across invoices give search something real to match.`));

  const distinctCurrencies = new Set(mockInvoices.map((invoice) => invoice.currency)).size;
  const distinctStatuses = invoiceStatusesPresent.size;
  checks.push(check('Filters', distinctCurrencies >= 2 && distinctStatuses >= 4, `${distinctCurrencies} currencies and ${distinctStatuses} statuses give status/currency filters something to filter.`));

  return checks;
}
