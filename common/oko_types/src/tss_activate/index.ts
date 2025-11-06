export interface TssActivationSetting {
  activation_key: TssActivationKey;
  is_enabled: boolean;
  description: string | null;
  updated_at: Date;
}

export type TssActivationKey = "tss_all";
