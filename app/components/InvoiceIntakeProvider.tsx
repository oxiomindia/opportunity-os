'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { Invoice } from '../../types/invoice';
import type { TemporaryIntakeRecord } from '../../types/upload';

interface InvoiceIntakeContextValue {
  intakeRecords: TemporaryIntakeRecord[];
  intakeInvoices: Invoice[];
  addIntakeRecords: (records: TemporaryIntakeRecord[]) => void;
  clearIntakeRecords: () => void;
}

const InvoiceIntakeContext = createContext<InvoiceIntakeContextValue | null>(null);

function buildTemporaryInvoice(record: TemporaryIntakeRecord, index: number): Invoice {
  const invoiceNumber = `UPLOAD-${String(index + 1).padStart(4, '0')}`;
  const intakeDate = record.uploadedAt.slice(0, 10);

  return {
    id: record.id,
    invoiceNumber,
    vendorName: 'Pending vendor review',
    invoiceDate: intakeDate,
    dueDate: intakeDate,
    currency: 'USD',
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'received',
    confidence: 0,
    source: record.source,
    receivedAt: record.uploadedAt,
    exceptionCount: 0,
    fileName: record.filename,
    fileType: record.mimeType === 'application/pdf' ? 'pdf' : record.mimeType === 'image/png' ? 'png' : 'jpg',
  };
}

export function InvoiceIntakeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [intakeRecords, setIntakeRecords] = useState<TemporaryIntakeRecord[]>([]);

  const intakeInvoices = useMemo(
    () => intakeRecords.map((record, index) => buildTemporaryInvoice(record, index)),
    [intakeRecords],
  );

  function addIntakeRecords(records: TemporaryIntakeRecord[]) {
    if (records.length === 0) return;
    setIntakeRecords((currentRecords) => {
      const existingIds = new Set(currentRecords.map((record) => record.id));
      const nextRecords = records.filter((record) => !existingIds.has(record.id));
      return [...nextRecords, ...currentRecords];
    });
  }

  function clearIntakeRecords() {
    setIntakeRecords([]);
  }

  return (
    <InvoiceIntakeContext.Provider value={{ intakeRecords, intakeInvoices, addIntakeRecords, clearIntakeRecords }}>
      {children}
    </InvoiceIntakeContext.Provider>
  );
}

export function useInvoiceIntake() {
  const context = useContext(InvoiceIntakeContext);
  if (!context) throw new Error('useInvoiceIntake must be used within InvoiceIntakeProvider');
  return context;
}
