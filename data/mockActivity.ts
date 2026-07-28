import type { ActivityEvent } from '../types/activity';
import { mockInvoices } from './mockInvoices';

const invoiceById = new Map(mockInvoices.map((invoice) => [invoice.id, invoice]));

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: 'act_1001_overdue',
    title: 'Invoice is now overdue',
    description: `${invoiceById.get('inv_1004')?.invoiceNumber ?? 'Invoice'} passed its due date without payment.`,
    category: 'invoice',
    severity: 'critical',
    createdAt: '2026-07-24T10:20:00Z',
    href: '/invoices/inv_1004',
    actor: 'Oxiom',
    unread: true,
  },
  {
    id: 'act_1002_paid',
    title: 'Invoice paid in full',
    description: `${invoiceById.get('inv_1002')?.invoiceNumber ?? 'Invoice'} was marked as paid.`,
    category: 'invoice',
    severity: 'success',
    createdAt: '2026-07-24T09:45:00Z',
    href: '/invoices/inv_1002',
    actor: 'Oxiom',
    unread: true,
  },
  {
    id: 'act_1003_partial_payment',
    title: 'Partial payment recorded',
    description: `${invoiceById.get('inv_1005')?.invoiceNumber ?? 'Invoice'} received a partial payment.`,
    category: 'invoice',
    severity: 'info',
    createdAt: '2026-07-24T08:30:00Z',
    href: '/invoices/inv_1005',
    actor: 'Oxiom',
    unread: false,
  },
  {
    id: 'act_1004_digest',
    title: 'Daily billing digest generated',
    description: 'New invoice and payment metrics are available in Reports.',
    category: 'system',
    severity: 'info',
    createdAt: '2026-07-23T17:00:00Z',
    href: '/reports',
    actor: 'System',
    unread: false,
  },
];
