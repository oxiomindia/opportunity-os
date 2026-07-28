import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import type { Invoice, InvoiceLineItem } from '../../types/invoice';
import { formatInvoiceCurrency, formatInvoiceDate, getInvoiceStatusLabel } from '../invoiceFormatters';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#0f172a' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  organizationName: { fontSize: 16, fontWeight: 700 },
  invoiceTitle: { fontSize: 20, fontWeight: 700, textAlign: 'right' },
  invoiceNumber: { fontSize: 10, color: '#475569', textAlign: 'right', marginTop: 4 },
  statusLabel: { fontSize: 10, color: '#475569', textAlign: 'right', marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  infoBlock: { flexDirection: 'column', gap: 2 },
  label: { fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  value: { fontSize: 11 },
  table: { marginTop: 8 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 6 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 8 },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colUnitPrice: { flex: 1.4, textAlign: 'right' },
  colLineTotal: { flex: 1.4, textAlign: 'right' },
  tableHeaderText: { fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  totalsBlock: { marginTop: 16, alignSelf: 'flex-end', width: 220 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalsLabel: { color: '#475569' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 6, marginTop: 6 },
  grandTotalLabel: { fontSize: 11, fontWeight: 700 },
  grandTotalValue: { fontSize: 11, fontWeight: 700 },
});

interface InvoicePdfDocumentProps {
  readonly invoice: Invoice;
  readonly lineItems: readonly InvoiceLineItem[];
  readonly organizationName: string;
}

export function InvoicePdfDocument({ invoice, lineItems, organizationName }: InvoicePdfDocumentProps) {
  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.organizationName}>{organizationName}</Text>
          <View>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.statusLabel}>{getInvoiceStatusLabel(invoice.status)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Billed to</Text>
            <Text style={styles.value}>{invoice.customerName}</Text>
            {invoice.customerEmail ? <Text style={styles.value}>{invoice.customerEmail}</Text> : null}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Invoice date</Text>
            <Text style={styles.value}>{formatInvoiceDate(invoice.invoiceDate)}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Due date</Text>
            <Text style={styles.value}>{formatInvoiceDate(invoice.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>Unit price</Text>
            <Text style={[styles.tableHeaderText, styles.colLineTotal]}>Line total</Text>
          </View>
          {lineItems.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.colDescription}>No line items.</Text>
            </View>
          ) : (
            lineItems.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.colDescription}>{item.description}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colUnitPrice}>{formatInvoiceCurrency(item.unitPrice, invoice.currency)}</Text>
                <Text style={styles.colLineTotal}>{formatInvoiceCurrency(item.lineTotal, invoice.currency)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{formatInvoiceCurrency(invoice.subtotal, invoice.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text>{formatInvoiceCurrency(invoice.tax, invoice.currency)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatInvoiceCurrency(invoice.total, invoice.currency)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function renderInvoicePdfBuffer(props: InvoicePdfDocumentProps): Promise<Buffer> {
  return renderToBuffer(<InvoicePdfDocument {...props} />);
}
