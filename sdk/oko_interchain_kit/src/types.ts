import type { Wallet } from "@interchain-kit/core";
import type { SignInType } from "@oko-wallet/oko-sdk-core";

export interface OkoLoginMethod {
  provider: SignInType;
}

export interface OkoWalletOptions {
  apiKey: string;
  sdkEndpoint?: string;
  loginMethods?: OkoLoginMethod[];
}

export interface OkoWalletInternalOptions {
  apiKey: string;
  sdkEndpoint?: string;
  loginProvider: SignInType;
}

export type OkoWalletInfo = Wallet & { options: OkoWalletInternalOptions };
