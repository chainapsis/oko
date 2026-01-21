import { registerWallet } from "@wallet-standard/wallet";

import type { WalletStandardConfig } from "./chains";
import { OkoStandardWallet } from "./wallet";
import type { OkoSvmWalletInterface } from "@oko-wallet-sdk-svm/types";

const registeredWallets = new WeakSet<OkoSvmWalletInterface>();

export function registerWalletStandard(
  wallet: OkoSvmWalletInterface,
  configs: WalletStandardConfig[],
): void {
  if (registeredWallets.has(wallet)) {
    return;
  }

  const standardWallet = new OkoStandardWallet(wallet, configs);
  registerWallet(standardWallet);

  registeredWallets.add(wallet);
}
