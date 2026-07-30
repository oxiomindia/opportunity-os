/** Single source of truth for Oxiom's payment details — any payment page or QR generation reads from here, not a hardcoded copy. */
export const paymentConfig = {
  upiId: '8310457215@ybl',
  whatsapp: '8310457215',
  payeeName: 'S Umesh Rao',
} as const;

/** UPI deep link (opens any UPI app on mobile) for a payment, optionally for a specific amount and note. amountPaise is in paise (1/100 rupee), matching how prices are stored elsewhere in this codebase. */
export function buildUpiPaymentLink(amountPaise?: number, note?: string): string {
  const params = new URLSearchParams({ pa: paymentConfig.upiId, pn: paymentConfig.payeeName, cu: 'INR' });
  if (amountPaise) params.set('am', (amountPaise / 100).toFixed(2));
  if (note) params.set('tn', note);
  return `upi://pay?${params.toString()}`;
}

/** WhatsApp click-to-chat link, optionally pre-filled with a message. */
export function buildWhatsAppLink(message?: string): string {
  const params = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/91${paymentConfig.whatsapp}${params}`;
}
