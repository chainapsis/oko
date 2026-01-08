import { OkoMainWallet } from "./main-wallet";
import { okoWalletInfo } from "./registry";
import type { OkoWalletOptions } from "./types";

export const makeOkoWallet = (options: OkoWalletOptions): OkoMainWallet => {
  return new OkoMainWallet({
    ...okoWalletInfo,
    options,
  });
};

export { OkoChainWallet } from "./chain-wallet";
export { OkoWalletClient } from "./client";
export { OkoMainWallet } from "./main-wallet";
export { okoWalletInfo } from "./registry";
export type { OkoWalletOptions } from "./types";
