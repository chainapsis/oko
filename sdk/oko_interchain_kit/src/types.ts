import type { Wallet } from "@interchain-kit/core";

export type OkoLoginProvider = "google" | "email" | "x" | "telegram" | "discord";

export interface OkoLoginMethod {
  provider: OkoLoginProvider;
}

export interface OkoWalletOptions {
  apiKey: string;
  sdkEndpoint?: string;
  loginMethods?: OkoLoginMethod[];
}

export interface OkoWalletInternalOptions {
  apiKey: string;
  sdkEndpoint?: string;
  loginProvider: OkoLoginProvider;
}

export type OkoWalletInfo = Wallet & { options: OkoWalletInternalOptions };
