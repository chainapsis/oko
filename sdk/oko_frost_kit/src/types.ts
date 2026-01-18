import type { OkoWalletInitArgs } from "@oko-wallet/oko-sdk-core";

export interface OkoFrostWalletOptions extends OkoWalletInitArgs {
  // Frost-specific options if any
}

export interface OkoFrostWalletInfo {
  name: string;
  prettyName: string;
  logo: string;
  mode: string;
  mobileDisabled: boolean;
  options?: OkoFrostWalletOptions;
}
