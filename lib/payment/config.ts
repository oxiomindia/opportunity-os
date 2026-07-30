import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface PaymentConfig {
  upiId: string;
  whatsapp: string;
  payeeName: string;
}

/** Single source of truth for Oxiom's payment details — reads live from commercial_settings (Control Center > Settings) rather than a hardcoded copy. */
export async function getPaymentConfig(): Promise<PaymentConfig> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('commercial_settings')
    .select('upi_id, whatsapp_number, payee_name')
    .eq('id', 'global')
    .single();
  if (error || !data || !data.upi_id || !data.whatsapp_number || !data.payee_name) {
    throw new Error('Payment configuration is not set — configure it in Control Center > Settings');
  }
  return { upiId: data.upi_id, whatsapp: data.whatsapp_number, payeeName: data.payee_name };
}

/** UPI deep link (opens any UPI app on mobile) for a payment, optionally for a specific amount and note. amountPaise is in paise (1/100 rupee), matching how prices are stored elsewhere in this codebase. */
export function buildUpiPaymentLink(config: PaymentConfig, amountPaise?: number, note?: string): string {
  const params = new URLSearchParams({ pa: config.upiId, pn: config.payeeName, cu: 'INR' });
  if (amountPaise) params.set('am', (amountPaise / 100).toFixed(2));
  if (note) params.set('tn', note);
  return `upi://pay?${params.toString()}`;
}

/** WhatsApp click-to-chat link, optionally pre-filled with a message. */
export function buildWhatsAppLink(config: PaymentConfig, message?: string): string {
  const params = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/91${config.whatsapp}${params}`;
}
