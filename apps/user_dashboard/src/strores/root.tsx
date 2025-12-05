import { ChainStore } from "./chain";
import { EmbedChainInfos, TokenContractListURL } from "./configs/config";
import {
  EthereumEndpoint,
  SkipTokenInfoBaseURL,
  SkipTokenInfoAPIURI,
  CoinGeckoAPIEndPoint,
  CoinGeckoCoinDataByTokenAddress,
  FiatCurrencies,
  CoinGeckoGetPrice,
} from "./configs/config.ui";
import {
  AccountStore,
  CoinGeckoPriceStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  OsmosisQueries,
  getKeplrFromWindow,
  QueriesStore,
  SecretAccount,
  SecretQueries,
  ICNSQueries,
  AgoricQueries,
  NobleQueries,
  NobleAccount,
} from "@keplr-wallet/stores";
import { HugeQueriesStore } from "./huge-queries";
import { SwapUsageQueries } from "./swap-usage/queries";
import { SkipQueries } from "./skip";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";
import { EthereumQueries } from "@keplr-wallet/stores-eth";
import { IndexedDBKVStore } from "@keplr-wallet/common";
import { FiatCurrency } from "@keplr-wallet/types";
import { TokenContractsQueries } from "./token-contracts";

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
  public readonly accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount, NobleAccount]
  >;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly hugeQueriesStore: HugeQueriesStore;

  constructor() {
    this.chainStore = new ChainStore(
      new IndexedDBKVStore("store_chains"),
      EmbedChainInfos,
    );

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

    this.accountStore = new AccountStore(
      window,
      this.chainStore,
      getKeplrFromWindow,
      () => {
        return {
          suggestChain: false,
          autoInit: true,
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
      }),
      CosmwasmAccount.use({
        queriesStore: this.queriesStore,
      }),
      SecretAccount.use({
        queriesStore: this.queriesStore,
      }),
      NobleAccount.use({
        queriesStore: this.queriesStore,
      }),
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
      this.accountStore,
      this.priceStore,
      this.skipQueriesStore,
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
