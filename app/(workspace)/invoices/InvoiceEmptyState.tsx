import EmptyState from '../../components/EmptyState';

export default function InvoiceEmptyState({ hasFilters }: Readonly<{ hasFilters: boolean }>) {
  return (
    <EmptyState
      icon="□"
      title={hasFilters ? 'No invoices match your filters' : 'No invoices yet'}
      description={
        hasFilters
          ? 'Try clearing filters or adjusting your search to see invoices in this worklist.'
          : 'Invoices you create will appear here.'
      }
      action={hasFilters ? undefined : { label: 'Create your first invoice', href: '/invoices/new' }}
    />
  );
}
