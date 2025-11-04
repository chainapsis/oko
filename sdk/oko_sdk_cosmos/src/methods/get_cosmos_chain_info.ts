import type { ChainInfo } from "@keplr-wallet/types";

import type { OkoCosmosWalletInterface } from "@oko-wallet-sdk-cosmos/types";
import { sendGetCosmosChainInfo } from "@oko-wallet-sdk-cosmos/utils/chain";

export async function getCosmosChainInfo(
  this: OkoCosmosWalletInterface,
): Promise<ChainInfo[]> {
  const chainInfoRes = await sendGetCosmosChainInfo(this.okoWallet);

  if (!chainInfoRes.success) {
    throw new Error(
      `Failed to get chain registry response: ${chainInfoRes.err.toString()}`,
    );
  }

  return chainInfoRes.data;
}
