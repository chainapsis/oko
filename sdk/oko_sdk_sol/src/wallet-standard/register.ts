import { registerWallet } from "@wallet-standard/wallet";

import { OkoStandardWallet } from "./wallet";
import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

let registered = false;

export function registerOkoWallet(wallet: OkoSolWalletInterface): void {
  if (registered) {
    return;
  }

  const standardWallet = new OkoStandardWallet(wallet);
  registerWallet(standardWallet);
  registered = true;
}
