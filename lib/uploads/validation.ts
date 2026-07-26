export const maxInvoiceFileSize = 25 * 1024 * 1024;
export const allowedInvoiceMimeTypes = new Set(['application/pdf', 'image/png', 'image/jpeg']);

export function matchesInvoiceSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === 'application/pdf') return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (mimeType === 'image/png') return bytes.slice(0, 8).every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (mimeType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return false;
}

export function sanitizeInvoiceFilename(filename: string) {
  return filename.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120) || 'invoice';
}
