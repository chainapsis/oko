import type { Key, SettledResponses } from "@keplr-wallet/types";

import type { OkoCosmosWalletInterface } from "@oko-wallet-sdk-cosmos/types";

export async function getKeysSettled(
  this: OkoCosmosWalletInterface,
  chainIds: string[],
): Promise<SettledResponses<Key>> {
  await this.waitUntilInitialized;

  return Promise.allSettled(chainIds.map((chainId) => this.getKey(chainId)));
}
