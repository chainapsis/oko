import type { Wallet } from "@cosmos-kit/core";

export interface OkoWalletOptions {
  apiKey: string;
  sdkEndpoint?: string;
}

export type OkoWalletInfo = Wallet & { options: OkoWalletOptions };
