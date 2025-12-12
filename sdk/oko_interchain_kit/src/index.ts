import type { SignInType } from "@oko-wallet/oko-sdk-core";

import { OkoWallet } from "./oko-wallet";
import { okoWalletInfo } from "./registry";
import type { OkoWalletOptions } from "./types";
import { initializeOkoCosmosWallet } from "./init";
import { PROVIDER_CONFIG } from "./constant";

export const makeOkoWallets = (options: OkoWalletOptions): OkoWallet[] => {
  if (typeof window === "undefined") {
    throw new Error(
      "Oko Wallet can only be initialized in browser environment",
    );
  }

  // If no loginMethods specified, use all available providers
  const providers =
    options.loginMethods?.map((m) => m.provider) ??
    (Object.keys(PROVIDER_CONFIG) as SignInType[]);

  return providers.map((provider) => {
    const providerConfig = PROVIDER_CONFIG[provider];

    const internalOptions = {
      ...options,
      loginProvider: provider,
    };

    const okoClient = initializeOkoCosmosWallet(internalOptions);

    const walletInfo = {
      ...okoWalletInfo,
      name: okoWalletInfo.name + "_" + provider,
      prettyName: providerConfig?.name || okoWalletInfo.prettyName,
      logo: okoWalletInfo.logo,
    };

    return new OkoWallet(walletInfo, okoClient, provider);
  });
};

export { okoWalletInfo } from "./registry";
export type { OkoLoginMethod, OkoWalletOptions } from "./types";
