import { registerWallet } from "@wallet-standard/wallet";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";
import type { WalletStandardConfig } from "./chains";
import { OkoStandardWallet } from "./wallet";

const registeredWallets = new WeakSet<OkoSolWalletInterface>();

export function registerWalletStandard(
  wallet: OkoSolWalletInterface,
  config: WalletStandardConfig,
): void {
  if (registeredWallets.has(wallet)) {
    return;
  }

  const standardWallet = new OkoStandardWallet(wallet, config);
  registerWallet(standardWallet);
  registeredWallets.add(wallet);
}
