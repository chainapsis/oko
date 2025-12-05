import { QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryAssets } from "./assets";
import { InternalChainStore } from "../types/chain-info";
import { SwapUsageQueries } from "../swap-usage/queries";

const SWAP_API_ENDPOINT = process.env["KEPLR_API_ENDPOINT"] ?? "";

export class SkipQueries {
  public readonly queryAssets: DeepReadonly<ObservableQueryAssets>;

  constructor(
    sharedContext: QuerySharedContext,
    chainStore: InternalChainStore,
    swapUsageQueries: SwapUsageQueries
  ) {
    this.queryAssets = new ObservableQueryAssets(
      sharedContext,
      chainStore,
      swapUsageQueries,
      SWAP_API_ENDPOINT
    );
  }
}
