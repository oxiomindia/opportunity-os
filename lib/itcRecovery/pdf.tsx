import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import type { ItcReconciliationReport } from './report';
import { formatItcCurrency, formatItcDate, formatItcReportGeneratedAt, reconciliationStatusLabels, reconciliationStatusDescriptions } from '../itcRecoveryFormatters';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#0f172a' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  organizationName: { fontSize: 15, fontWeight: 700 },
  reportTitle: { fontSize: 16, fontWeight: 700, textAlign: 'right' },
  metaLine: { fontSize: 9, color: '#475569', textAlign: 'right', marginTop: 3 },
  sectionLabel: { fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  summaryCard: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 8 },
  summaryCardLabel: { fontSize: 8, color: '#64748b' },
  summaryCardValue: { fontSize: 12, fontWeight: 700, marginTop: 3 },
  legendRow: { flexDirection: 'row', marginBottom: 4, gap: 6 },
  legendLabel: { fontSize: 8, fontWeight: 700, width: 110 },
  legendDescription: { fontSize: 8, color: '#475569', flex: 1 },
  legendBlock: { marginBottom: 18 },
  table: { marginTop: 4 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 5 },
  tableHeaderText: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  colVendor: { flex: 2.2 },
  colGstin: { flex: 1.6 },
  colInvoice: { flex: 1.4 },
  colDate: { flex: 1.1 },
  colAmount: { flex: 1.2, textAlign: 'right' },
  colStatus: { flex: 1.3 },
  colDifference: { flex: 1.1, textAlign: 'right' },
  cellText: { fontSize: 8 },
});

interface ItcReconciliationPdfDocumentProps {
  readonly report: ItcReconciliationReport;
}

export function ItcReconciliationPdfDocument({ report }: ItcReconciliationPdfDocumentProps) {
  return (
    <Document title="Input Tax Credit Reconciliation Report">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.organizationName}>{report.organizationName}</Text>
          <View>
            <Text style={styles.reportTitle}>Input Tax Credit Reconciliation Report</Text>
            <Text style={styles.metaLine}>Return period: {report.period ?? 'All periods'}</Text>
            <Text style={styles.metaLine}>Generated: {formatItcReportGeneratedAt(report.generatedAt)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Total Purchase Tax</Text>
            <Text style={styles.summaryCardValue}>{formatItcCurrency(report.summary.totalPurchaseTax)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Total Return Tax</Text>
            <Text style={styles.summaryCardValue}>{formatItcCurrency(report.summary.totalReturnTax)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Recoverable ITC</Text>
            <Text style={styles.summaryCardValue}>{formatItcCurrency(report.summary.recoverableItc)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>At-Risk ITC</Text>
            <Text style={styles.summaryCardValue}>{formatItcCurrency(report.summary.atRiskItc)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Reconciliation %</Text>
            <Text style={styles.summaryCardValue}>{report.summary.reconciliationPercentage}%</Text>
          </View>
        </View>

        <View style={styles.legendBlock}>
          <Text style={styles.sectionLabel}>Legend</Text>
          {(Object.keys(reconciliationStatusLabels) as (keyof typeof reconciliationStatusLabels)[]).map((status) => (
            <View key={status} style={styles.legendRow}>
              <Text style={styles.legendLabel}>{reconciliationStatusLabels[status]}</Text>
              <Text style={styles.legendDescription}>{reconciliationStatusDescriptions[status]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Detailed Records ({report.rows.length})</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderText, styles.colVendor]}>Vendor</Text>
            <Text style={[styles.tableHeaderText, styles.colGstin]}>GSTIN</Text>
            <Text style={[styles.tableHeaderText, styles.colInvoice]}>Invoice Number</Text>
            <Text style={[styles.tableHeaderText, styles.colDate]}>Invoice Date</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Purchase Tax</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Return Tax</Text>
            <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
            <Text style={[styles.tableHeaderText, styles.colDifference]}>Difference</Text>
          </View>
          {report.rows.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.cellText}>No reconciliation records for this period.</Text>
            </View>
          ) : (
            report.rows.map((row, index) => {
              const invoiceDate = row.purchaseRecord?.invoiceDate ?? row.returnRecord?.invoiceDate;
              return (
                <View key={index} style={styles.tableRow} wrap={false}>
                  <Text style={[styles.cellText, styles.colVendor]}>{row.purchaseRecord?.vendorName ?? row.returnRecord?.vendorName ?? ''}</Text>
                  <Text style={[styles.cellText, styles.colGstin]}>{row.purchaseRecord?.vendorGstin ?? row.returnRecord?.vendorGstin ?? ''}</Text>
                  <Text style={[styles.cellText, styles.colInvoice]}>{row.purchaseRecord?.invoiceNumber ?? row.returnRecord?.returnInvoiceNumber ?? ''}</Text>
                  <Text style={[styles.cellText, styles.colDate]}>{invoiceDate ? formatItcDate(invoiceDate) : '—'}</Text>
                  <Text style={[styles.cellText, styles.colAmount]}>{row.purchaseRecord ? formatItcCurrency(row.purchaseRecord.taxAmount) : '—'}</Text>
                  <Text style={[styles.cellText, styles.colAmount]}>{row.returnRecord ? formatItcCurrency(row.returnRecord.taxAmount) : '—'}</Text>
                  <Text style={[styles.cellText, styles.colStatus]}>{reconciliationStatusLabels[row.status]}</Text>
                  <Text style={[styles.cellText, styles.colDifference]}>{row.taxDifference !== undefined ? formatItcCurrency(row.taxDifference) : '—'}</Text>
                </View>
              );
            })
          )}
        </View>
      </Page>
    </Document>
  );
}

export function renderItcReconciliationPdfBuffer(report: ItcReconciliationReport): Promise<Buffer> {
  return renderToBuffer(<ItcReconciliationPdfDocument report={report} />);
}
