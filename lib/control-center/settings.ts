import 'server-only';

import { createSupabaseServerClient } from '../supabase/server';

export interface CommercialSettings {
  businessName: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  whatsappNumber: string | null;
  upiId: string | null;
  payeeName: string | null;
  brandColor: string | null;
  defaultTrialDurationDays: number;
  currency: string;
  timezone: string;
}

export async function getCommercialSettings(): Promise<CommercialSettings> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('commercial_settings')
    .select('business_name, support_email, support_phone, whatsapp_number, upi_id, payee_name, brand_color, default_trial_duration_days, currency, timezone')
    .eq('id', 'global')
    .single();
  if (error || !data) throw new Error('Unable to load commercial settings');
  return {
    businessName: data.business_name,
    supportEmail: data.support_email,
    supportPhone: data.support_phone,
    whatsappNumber: data.whatsapp_number,
    upiId: data.upi_id,
    payeeName: data.payee_name,
    brandColor: data.brand_color,
    defaultTrialDurationDays: data.default_trial_duration_days,
    currency: data.currency,
    timezone: data.timezone,
  };
}
