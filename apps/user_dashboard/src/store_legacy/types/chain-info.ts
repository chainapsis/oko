import type { IChainStore } from "@keplr-wallet/stores";
import type { ChainInfo } from "@keplr-wallet/types";

export interface InternalChainStore<
  C extends ChainInfo = ChainInfo,
> extends IChainStore<C> {
  isInModularChainInfosInListUI(chainId: string): boolean;
}
