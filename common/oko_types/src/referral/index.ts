export interface Referral {
  referral_id: string;
  user_id: string;
  public_key: string; // hex string
  origin: string;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReferralRequest {
  origin: string;
  utm_source?: string | null;
  utm_campaign?: string | null;
}

export interface CreateReferralResponse {
  referral_id: string;
}

export interface GetReferralResponse {
  referrals: Array<{
    utm_source: string | null;
    utm_campaign: string | null;
    created_at: string;
  }>;
}

export interface ReferralInfo {
  origin: string;
  utmSource: string | null;
  utmCampaign: string | null;
}
