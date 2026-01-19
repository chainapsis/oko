import { registerWallet } from "@wallet-standard/wallet";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";
import type { WalletStandardConfig } from "./chains";
import { OkoStandardWallet } from "./wallet";

const registeredConfigs = new Set<string>();

function getConfigKey(config: WalletStandardConfig): string {
  return config.chains.join(",");
}

export function registerWalletStandard(
  wallet: OkoSolWalletInterface,
  config: WalletStandardConfig,
): void {
  const key = getConfigKey(config);
  if (registeredConfigs.has(key)) {
    return;
  }

  const standardWallet = new OkoStandardWallet(wallet, config);
  registerWallet(standardWallet);
  registeredConfigs.add(key);
}
