import { OkoWallet } from "./oko-wallet";
import { okoWalletInfo } from "./registry";
import type { OkoWalletOptions } from "./types";
import { initializeOkoCosmosWallet } from "./init";

export const okoWallet = (options: OkoWalletOptions) => {
  if (typeof window === "undefined") {
    throw new Error("Oko Wallet can only be initialized in browser environment");
  }

  const okoClient = initializeOkoCosmosWallet(options);
  return new OkoWallet(okoWalletInfo, okoClient, options.loginProvider);
};

export { okoWalletInfo } from "./registry";
export type { OkoLoginMethod, OkoLoginProvider, OkoWalletOptions } from "./types";
