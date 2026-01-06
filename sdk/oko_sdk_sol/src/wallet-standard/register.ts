import { registerWallet } from "@wallet-standard/wallet";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";
import { OkoStandardWallet } from "./wallet";

let registered = false;

export function registerOkoWallet(wallet: OkoSolWalletInterface): void {
  if (registered) {
    return;
  }

  const standardWallet = new OkoStandardWallet(wallet);
  registerWallet(standardWallet);
  registered = true;
}
