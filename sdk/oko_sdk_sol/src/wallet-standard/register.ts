import { registerWallet } from "@wallet-standard/wallet";

import type { WalletStandardConfig } from "./chains";
import { OkoStandardWallet } from "./wallet";
import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

const registeredWallets = new WeakSet<OkoSolWalletInterface>();

export function registerWalletStandard(
  wallet: OkoSolWalletInterface,
  configs: WalletStandardConfig[],
): void {
  if (registeredWallets.has(wallet)) {
    return;
  }

  for (const config of configs) {
    const standardWallet = new OkoStandardWallet(wallet, config);
    registerWallet(standardWallet);
  }

  registeredWallets.add(wallet);
}
