import type { ActivityEvent } from '../types/activity';
import { mockInvoices } from './mockInvoices';

const invoiceById = new Map(mockInvoices.map((invoice) => [invoice.id, invoice]));

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: 'act_1001_exception',
    title: 'High exception invoice needs review',
    description: `${invoiceById.get('inv_1009')?.invoiceNumber ?? 'Invoice'} has 5 extraction exceptions and is assigned to Mateo Rivera.`,
    category: 'verification',
    severity: 'critical',
    createdAt: '2026-07-24T10:20:00Z',
    href: '/invoices/inv_1009',
    actor: 'Oxiom AI',
    unread: true,
  },
  {
    id: 'act_1002_payment_ready',
    title: 'Payment batch candidate is ready',
    description: `${invoiceById.get('inv_1004')?.invoiceNumber ?? 'Invoice'} can be included in the next treasury export.`,
    category: 'payment',
    severity: 'success',
    createdAt: '2026-07-24T09:45:00Z',
    href: '/payment-queue',
    actor: 'Payment Queue',
    unread: true,
  },
  {
    id: 'act_1003_accounts_review',
    title: 'Accounts review queue updated',
    description: 'Controller policy checklist was refreshed for high-value and vendor-bank validation.',
    category: 'accounts-review',
    severity: 'info',
    createdAt: '2026-07-24T08:30:00Z',
    href: '/accounts-review',
    actor: 'Accounts Review',
    unread: false,
  },
  {
    id: 'act_1004_low_confidence',
    title: 'Low confidence capture detected',
    description: `${invoiceById.get('inv_1010')?.invoiceNumber ?? 'Invoice'} is below confidence threshold and remains rejected.`,
    category: 'verification',
    severity: 'warning',
    createdAt: '2026-07-23T18:15:00Z',
    href: '/verification',
    actor: 'Oxiom AI',
    unread: false,
  },
  {
    id: 'act_1005_intake_digest',
    title: 'Daily intake digest generated',
    description: 'New invoice intake, verification, and payment metrics are available in Reports.',
    category: 'system',
    severity: 'info',
    createdAt: '2026-07-23T17:00:00Z',
    href: '/reports',
    actor: 'System',
    unread: false,
  },
];
