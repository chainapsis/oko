import { KeplrETCQueries } from "@keplr-wallet/stores-etc";
import { IndexedDBKVStore } from "@keplr-wallet/common";
import { FiatCurrency } from "@keplr-wallet/types";
import {
  CoinGeckoPriceStore,
  CosmosQueries,
  CosmwasmQueries,
  OsmosisQueries,
  getKeplrFromWindow,
  SecretQueries,
  ICNSQueries,
  AgoricQueries,
  NobleQueries,
  QueriesStore,
} from "@keplr-wallet/stores";

// import { QueriesStore } from "./queries";
import { ChainStore } from "./chain";
import { TokenContractListURL } from "./configs/config";
import {
  EthereumEndpoint,
  SkipTokenInfoBaseURL,
  SkipTokenInfoAPIURI,
  CoinGeckoAPIEndPoint,
  CoinGeckoCoinDataByTokenAddress,
  FiatCurrencies,
  CoinGeckoGetPrice,
} from "./configs/config.ui";
import { HugeQueriesStore } from "./huge-queries";
import { SwapUsageQueries } from "./swap-usage/queries";
import { SkipQueries } from "./skip";
import { TokenContractsQueries } from "./token-contracts";
import { OkoWalletAddressStore } from "./address-store";
import { EthereumQueries } from "./eth";

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<
    [
      AgoricQueries,
      CosmosQueries,
      CosmwasmQueries,
      SecretQueries,
      OsmosisQueries,
      KeplrETCQueries,
      ICNSQueries,
      TokenContractsQueries,
      EthereumQueries,
      NobleQueries,
    ]
  >;
  public readonly swapUsageQueries: SwapUsageQueries;
  public readonly skipQueriesStore: SkipQueries;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly hugeQueriesStore: HugeQueriesStore;
  public readonly okoWalletAddressStore: OkoWalletAddressStore;

  constructor() {
    this.okoWalletAddressStore = new OkoWalletAddressStore();

    this.chainStore = new ChainStore(new IndexedDBKVStore("store_chains"));

    this.queriesStore = new QueriesStore(
      new IndexedDBKVStore("store_queries"),
      this.chainStore,
      {
        responseDebounceMs: 75,
      },
      AgoricQueries.use(),
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      SecretQueries.use({
        apiGetter: getKeplrFromWindow,
      }),
      OsmosisQueries.use(),
      KeplrETCQueries.use({
        ethereumURL: EthereumEndpoint,
        skipTokenInfoBaseURL: SkipTokenInfoBaseURL,
        skipTokenInfoAPIURI: SkipTokenInfoAPIURI,
        txCodecBaseURL: process.env["KEPLR_EXT_TX_CODEC_BASE_URL"] || "",
        topupBaseURL: process.env["KEPLR_EXT_TOPUP_BASE_URL"] || "",
      }),
      ICNSQueries.use(),
      TokenContractsQueries.use({
        tokenContractListURL: TokenContractListURL,
      }),
      EthereumQueries.use({
        coingeckoAPIBaseURL: CoinGeckoAPIEndPoint,
        coingeckoAPIURI: CoinGeckoCoinDataByTokenAddress,
      }),
      NobleQueries.use(),
    );

    this.swapUsageQueries = new SwapUsageQueries(
      this.queriesStore.sharedContext,
      process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"] || "",
    );

    this.skipQueriesStore = new SkipQueries(
      this.queriesStore.sharedContext,
      this.chainStore,
      this.swapUsageQueries,
    );

    this.priceStore = new CoinGeckoPriceStore(
      new IndexedDBKVStore("store_prices"),
      FiatCurrencies.reduce<{
        [vsCurrency: string]: FiatCurrency;
      }>((obj: any, fiat: any) => {
        obj[fiat.currency] = fiat;
        return obj;
      }, {}),
      "usd",
      {
        baseURL: CoinGeckoAPIEndPoint,
        uri: CoinGeckoGetPrice,
      },
    );

    this.hugeQueriesStore = new HugeQueriesStore(
      this.chainStore,
      this.queriesStore,
      this.priceStore,
      this.skipQueriesStore,
      this.okoWalletAddressStore,
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
