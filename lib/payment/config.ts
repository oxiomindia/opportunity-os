/** Single source of truth for Oxiom's payment details — any payment page or QR generation reads from here, not a hardcoded copy. */
export const paymentConfig = {
  upiId: '8310457215@ybl',
  whatsapp: '8310457215',
  payeeName: 'S Umesh Rao',
} as const;
