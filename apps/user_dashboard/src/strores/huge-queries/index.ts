import { ChainStore } from "../chain";
import { Asset, SkipQueries } from "../skip";
import { BinarySortArray } from "../sort";
import { action, autorun, computed, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { AllTokenMapByChainIdentifierState } from "./all-token-map-state";
import {
  CoinGeckoPriceStore,
  CosmosQueries,
  IAccountStore,
  IQueriesStore,
  QueryError,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { DenomHelper } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";
import { ModularChainInfo } from "../chain/chain-info";

export interface ViewToken {
  chainInfo: ModularChainInfo;
  token: CoinPretty;
  price: PricePretty | undefined;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

export interface ViewStakedToken extends ViewToken {
  stakingUrl?: string;
}

export interface ViewUnbondingToken extends ViewStakedToken {
  completeTime: string | number;
  omitCompleteTimeFraction?: boolean;
}

export type ViewRewardToken = ViewStakedToken;

/**
 * Note: Bitcoin, Starknet related logic isn't implemented in Oko products yet.
 */
export class HugeQueriesStore {
  protected static zeroDec = new Dec(0);

  protected balanceBinarySort: BinarySortArray<ViewToken>;

  protected allTokenMapByChainIdentifierState: AllTokenMapByChainIdentifierState;

  constructor(
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    protected readonly accountStore: IAccountStore,
    protected readonly priceStore: CoinGeckoPriceStore,
    protected readonly skipQueriesStore: SkipQueries,
  ) {
    let balanceDisposal: (() => void) | undefined;
    this.balanceBinarySort = new BinarySortArray<ViewToken>(
      this.sortByPrice,
      () => {
        balanceDisposal = autorun(() => {
          this.updateBalances();
        });
      },
      () => {
        if (balanceDisposal) {
          balanceDisposal();
        }
      },
    );

    let allTokenMapByChainIdentifierDisposal: (() => void) | undefined;
    this.allTokenMapByChainIdentifierState =
      new AllTokenMapByChainIdentifierState(
        () => {
          allTokenMapByChainIdentifierDisposal = autorun(() => {
            this.getAllTokenMapByChainIdentifier();
          });
        },
        () => {
          if (allTokenMapByChainIdentifierDisposal) {
            allTokenMapByChainIdentifierDisposal();
          }
        },
      );
  }

  @action
  protected updateBalances() {
    const keysUsed = new Map<string, boolean>();
    const prevKeyMap = new Map(this.balanceBinarySort.indexForKeyMap());

    for (const modularChainInfo of this.chainStore.modularChainInfosInUI) {
      const account = this.accountStore.getAccount(modularChainInfo.chainId);

      const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
        modularChainInfo.chainId,
      );

      if ("evm" in modularChainInfo) {
        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryBalance = queries.queryBalances.getQueryEthereumHexAddress(
          account.ethereumHexAddress,
        );

        // 외부에 요청된 balance를 기다려야 modularChainInfoImpl.getCurrenciesByModule("evm")에서 currencies 목록을 전부 얻을 수 있다.
        queryBalance.balances.forEach((b) => b.waitResponse());

        const currencies = modularChainInfoImpl.getCurrenciesByModule("evm");

        for (const currency of currencies) {
          const key = `${
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          }/${currency.coinMinimalDenom}`;

          if (!keysUsed.get(key)) {
            const balance = queryBalance.getBalance(currency);

            if (balance) {
              if (balance.balance.toDec().isZero()) {
                continue;
              }

              keysUsed.set(key, true);
              prevKeyMap.delete(key);
              this.balanceBinarySort.pushAndSort(key, {
                chainInfo: modularChainInfo,
                token: balance.balance,
                price: currency.coinGeckoId
                  ? this.priceStore.calculatePrice(balance.balance)
                  : undefined,
                isFetching: balance.isFetching,
                error: balance.error,
              });
            }
          }
        }
      }

      if ("cosmos" in modularChainInfo) {
        const cosmosChainInfo = modularChainInfo.cosmos;

        console.log("cosmosChainInfo", cosmosChainInfo);
        console.log("account", account.bech32Address);

        if (!cosmosChainInfo || account.bech32Address === "") {
          continue;
        }

        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryBalance = queries.queryBalances.getQueryBech32Address(
          account.bech32Address,
        );

        const currencies = [
          ...modularChainInfoImpl.getCurrenciesByModule("cosmos"),
        ];

        for (const currency of currencies) {
          if (cosmosChainInfo.bech32Config) {
            // ethermint 계열의 체인인 경우 ibc token을 보여주기 위해서 native 토큰에 대해서
            // cosmos 방식의 쿼리를 꼭 발생시켜야 한다.
            for (const bal of queries.queryBalances.getQueryBech32Address(
              account.bech32Address,
            ).balances) {
              if (
                new DenomHelper(bal.currency.coinMinimalDenom).type === "native"
              ) {
                bal.balance;
                break;
              }
            }
          }

          const key = `${
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          }/${currency.coinMinimalDenom}`;
          if (!keysUsed.get(key)) {
            if (
              cosmosChainInfo.stakeCurrency?.coinMinimalDenom ===
              currency.coinMinimalDenom
            ) {
              const balance = queryBalance.stakable?.balance;
              if (!balance) {
                continue;
              }
              // If the balance is zero, don't show it.
              // 다시 제로 일때 보여주기 위해서 아래코드를 주석처리함
              // if (balance.toDec().equals(HugeQueriesStore.zeroDec)) {
              //   continue;
              // }

              keysUsed.set(key, true);
              prevKeyMap.delete(key);
              this.balanceBinarySort.pushAndSort(key, {
                chainInfo: modularChainInfo,
                token: balance,
                price: currency.coinGeckoId
                  ? this.priceStore.calculatePrice(balance)
                  : undefined,
                isFetching: queryBalance.stakable.isFetching,
                error: queryBalance.stakable.error,
              });
            } else {
              const balance = queryBalance.getBalance(currency);
              if (balance) {
                if (balance.balance.toDec().equals(HugeQueriesStore.zeroDec)) {
                  const denomHelper = new DenomHelper(
                    currency.coinMinimalDenom,
                  );
                  // If the balance is zero and currency is "native" or "erc20", don't show it.
                  if (
                    denomHelper.type === "native" ||
                    denomHelper.type === "erc20"
                  ) {
                    // However, if currency is native currency and not ibc, and same with currencies[0],
                    // just show it as 0 balance.
                    if (
                      cosmosChainInfo.currencies.length > 0 &&
                      cosmosChainInfo.currencies[0].coinMinimalDenom ===
                        currency.coinMinimalDenom &&
                      !currency.coinMinimalDenom.startsWith("ibc/")
                    ) {
                      // 위의 if 문을 뒤집기(?) 귀찮아서 그냥 빈 if-else로 처리한다...
                    } else {
                      continue;
                    }
                  }
                }

                keysUsed.set(key, true);
                prevKeyMap.delete(key);
                this.balanceBinarySort.pushAndSort(key, {
                  chainInfo: modularChainInfo,
                  token: balance.balance,
                  price: currency.coinGeckoId
                    ? this.priceStore.calculatePrice(balance.balance)
                    : undefined,
                  isFetching: balance.isFetching,
                  error: balance.error,
                });
              }
            }
          }
        }
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.balanceBinarySort.remove(removedKey);
    }
  }

  get allTokenMapByChainIdentifier(): Map<string, ViewToken[]> {
    return this.allTokenMapByChainIdentifierState.map;
  }

  @action
  protected getAllTokenMapByChainIdentifier() {
    const tokensByChainId = new Map<string, ViewToken[]>();
    const modularChainInfos = this.chainStore.groupedModularChainInfos.filter(
      (chainInfo) => {
        if ("cosmos" in chainInfo && chainInfo.cosmos.hideInUI) {
          return false;
        }
        return true;
      },
    );

    for (const modularChainInfo of modularChainInfos) {
      const baseChainId = modularChainInfo.chainId;

      const chainIdentifier = ChainIdHelper.parse(baseChainId).identifier;

      if (!tokensByChainId.has(chainIdentifier)) {
        tokensByChainId.set(chainIdentifier, []);
      }

      const account = this.accountStore.getAccount(modularChainInfo.chainId);

      const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
        modularChainInfo.chainId,
      );

      if ("evm" in modularChainInfo && !("cosmos" in modularChainInfo)) {
        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryBalance = queries.queryBalances.getQueryEthereumHexAddress(
          account.ethereumHexAddress,
        );

        const currencies = [
          ...modularChainInfoImpl.getCurrenciesByModule("evm"),
        ];

        for (const currency of currencies) {
          const balance = queryBalance.getBalance(currency);
          if (!balance) {
            continue;
          }

          const denomHelper = new DenomHelper(currency.coinMinimalDenom);

          if (
            balance.balance.toDec().equals(HugeQueriesStore.zeroDec) &&
            (denomHelper.type === "native" || denomHelper.type === "erc20")
          ) {
            continue;
          }

          tokensByChainId.get(chainIdentifier)!.push({
            chainInfo: modularChainInfo,
            token: balance.balance,
            price: currency.coinGeckoId
              ? this.priceStore.calculatePrice(balance.balance)
              : undefined,
            isFetching: balance.isFetching,
            error: balance.error,
          });
        }
      }
      if ("cosmos" in modularChainInfo) {
        const cosmosChainInfo = modularChainInfo.cosmos;

        if (!cosmosChainInfo || account.bech32Address === "") {
          continue;
        }

        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryBalance = queries.queryBalances.getQueryBech32Address(
          account.bech32Address,
        );

        const currencies = [
          ...modularChainInfoImpl.getCurrenciesByModule("cosmos"),
        ];

        for (const currency of currencies) {
          if (
            cosmosChainInfo.stakeCurrency?.coinMinimalDenom ===
            currency.coinMinimalDenom
          ) {
            const balance = queryBalance.stakable?.balance;
            if (!balance) {
              continue;
            }

            if (
              tokensByChainId
                .get(chainIdentifier)!
                .find(
                  (token) =>
                    token.token.currency.coinMinimalDenom ===
                    currency.coinMinimalDenom,
                )
            ) {
              continue;
            }

            tokensByChainId.get(chainIdentifier)!.push({
              chainInfo: modularChainInfo,
              token: balance,
              price: currency.coinGeckoId
                ? this.priceStore.calculatePrice(balance)
                : undefined,
              isFetching: queryBalance.stakable.isFetching,
              error: queryBalance.stakable.error,
            });
          } else {
            const balance = queryBalance.getBalance(currency);
            if (balance) {
              if (balance.balance.toDec().equals(HugeQueriesStore.zeroDec)) {
                const denomHelper = new DenomHelper(currency.coinMinimalDenom);
                // If the balance is zero and currency is "native" or "erc20", don't show it.
                if (
                  denomHelper.type === "native" ||
                  denomHelper.type === "erc20"
                ) {
                  // However, if currency is native currency and not ibc, and same with currencies[0],
                  // just show it as 0 balance.
                  if (
                    cosmosChainInfo.currencies.length > 0 &&
                    cosmosChainInfo.currencies[0].coinMinimalDenom ===
                      currency.coinMinimalDenom &&
                    !currency.coinMinimalDenom.startsWith("ibc/")
                  ) {
                    // 위의 if 문을 뒤집기(?) 귀찮아서 그냥 빈 if-else로 처리한다...
                  } else {
                    continue;
                  }
                }
              }

              tokensByChainId.get(chainIdentifier)!.push({
                chainInfo: modularChainInfo,
                token: balance.balance,
                price: currency.coinGeckoId
                  ? this.priceStore.calculatePrice(balance.balance)
                  : undefined,
                isFetching: balance.isFetching,
                error: balance.error,
              });
            }
          }
        }
      }
    }

    for (const [chainId, tokens] of tokensByChainId.entries()) {
      tokensByChainId.set(
        chainId,
        tokens.sort((a, b) => this.sortByPrice(a, b)),
      );
    }

    runInAction(() => {
      this.allTokenMapByChainIdentifierState.map = tokensByChainId;
    });
  }

  @computed
  get allKnownBalances(): ReadonlyArray<ViewToken> {
    return this.balanceBinarySort.arr;
  }

  getAllBalances = computedFn(
    ({
      allowIBCToken,
    }: {
      allowIBCToken?: boolean;
    }): ReadonlyArray<ViewToken> => {
      const keys: Map<string, boolean> = new Map();

      for (const modularChainInfo of this.chainStore.modularChainInfosInUI) {
        const chainIdentifier = ChainIdHelper.parse(
          modularChainInfo.chainId,
        ).identifier;

        if ("cosmos" in modularChainInfo) {
          const currencies = this.chainStore
            .getModularChainInfoImpl(modularChainInfo.chainId)
            .getCurrenciesByModule("cosmos");

          for (const currency of currencies) {
            const denomHelper = new DenomHelper(currency.coinMinimalDenom);
            if (
              !allowIBCToken &&
              denomHelper.type === "native" &&
              denomHelper.denom.startsWith("ibc/")
            ) {
              continue;
            }

            const key = `${chainIdentifier}/${currency.coinMinimalDenom}`;
            keys.set(key, true);
          }
        }

        const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
          modularChainInfo.chainId,
        );
        for (const currency of modularChainInfoImpl.getCurrencies()) {
          const key = `${
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          }/${currency.coinMinimalDenom}`;
          keys.set(key, true);
        }
      }

      return this.balanceBinarySort.arr.filter((viewToken) => {
        const key = viewToken[BinarySortArray.SymbolKey];

        const r = keys.get(key);

        console.log("key", r);
        return r;
      });
    },
  );

  filterLowBalanceTokens = computedFn(
    (
      viewTokens: ReadonlyArray<ViewToken>,
    ): {
      filteredTokens: ViewToken[];
      lowBalanceTokens: ViewToken[];
    } => {
      const lowBalanceTokens: ViewToken[] = [];
      const filteredTokens = viewTokens.filter((viewToken) => {
        // Hide the unknown ibc tokens.
        if (
          "paths" in viewToken.token.currency &&
          !viewToken.token.currency.originCurrency
        ) {
          lowBalanceTokens.push(viewToken);
          return false;
        }

        // If currency has coinGeckoId, hide the low price tokens (under $1)
        if (viewToken.token.currency.coinGeckoId != null) {
          const isNotLowPrice =
            this.priceStore
              .calculatePrice(viewToken.token, "usd")
              ?.toDec()
              .gte(new Dec("1")) ?? false;

          if (!isNotLowPrice) {
            lowBalanceTokens.push(viewToken);
          }
          return isNotLowPrice;
        }

        // Else, if testnet hide all tokens
        if (
          "isTestnet" in viewToken.chainInfo &&
          viewToken.chainInfo.isTestnet
        ) {
          lowBalanceTokens.push(viewToken);
          return false;
        }

        if (viewToken.token.currency.coinGeckoId == null) {
          // Else, hide the low balance tokens (under 0.001)
          const isNotLowBalance = viewToken.token.toDec().gte(new Dec("0.001"));
          if (!isNotLowBalance) {
            lowBalanceTokens.push(viewToken);
          }
          return isNotLowBalance;
        }

        return true;
      });

      return {
        filteredTokens,
        lowBalanceTokens,
      };
    },
  );

  protected sortByPrice(a: ViewToken, b: ViewToken): number {
    const aPrice = a.price?.toDec() ?? HugeQueriesStore.zeroDec;
    const bPrice = b.price?.toDec() ?? HugeQueriesStore.zeroDec;

    if (aPrice.equals(bPrice)) {
      if (aPrice.equals(HugeQueriesStore.zeroDec)) {
        const aHasBalance = a.token.toDec().gt(HugeQueriesStore.zeroDec);
        const bHasBalance = b.token.toDec().gt(HugeQueriesStore.zeroDec);

        if (aHasBalance && !bHasBalance) {
          return -1;
        } else if (!aHasBalance && bHasBalance) {
          return 1;
        } else {
          return 0;
        }
      }
      return 0;
    } else if (aPrice.gt(bPrice)) {
      return -1;
    } else {
      return 1;
    }
  }

  // 그룹화 로직
  // 1. 먼저 IBC 토큰들을 originChainId와 originCurrency.coinMinimalDenom으로 그룹화
  // 2. ERC20 토큰 처리:
  //    - 토큰의 minimalDenom이 erc20:으로 시작하고, 그 뒤의 contractAddress가 skip asset의 contractAddress와 일치하면 정상 ERC20 토큰으로 간주
  //    - 토큰의 recommendedSymbol이 이미 존재하는 그룹의 originCurrency.coinDenom과 일치하거나(ERC20 & IBC 혼합 그룹),
  //    - 토큰의 recommendedSymbol이 이미 존재하는 그룹의 coinDenom과 일치하면(ERC20 그룹) 해당 그룹에 추가
  //    - 일치하는 그룹이 없으면 recommendedSymbol을 키로 새 그룹 생성
  // 3. 나머지 Unknown 토큰들은 단일 그룹으로 처리
  @computed
  get groupedTokensMap(): Map<string, ViewToken[]> {
    const tokensMap = new Map<string, ViewToken[]>();
    const processedTokens = new Map<ViewToken, boolean>();
    const allKnownBalances = this.getAllBalances({
      allowIBCToken: true,
    });

    // IBC
    for (const viewToken of allKnownBalances) {
      const currency = viewToken.token.currency;

      if (
        "paths" in currency &&
        currency.originChainId &&
        currency.originCurrency?.coinMinimalDenom
      ) {
        const originChainId = currency.originChainId;
        const coinMinimalDenom = currency.originCurrency.coinMinimalDenom;

        const groupKey = `${originChainId}/${coinMinimalDenom}`;

        if (!tokensMap.has(groupKey)) {
          tokensMap.set(groupKey, []);
        }

        this.addTokenToGroup(groupKey, viewToken, tokensMap);
        processedTokens.set(viewToken, true);
      }
    }

    // ERC20
    for (const viewToken of allKnownBalances) {
      if (processedTokens.has(viewToken)) {
        continue;
      }

      const currency = viewToken.token.currency;
      const chainId = viewToken.chainInfo.chainId;

      const erc20Asset = this.getErc20AssetForToken(chainId, currency);

      if (erc20Asset && erc20Asset.recommendedSymbol && currency.coinGeckoId) {
        const groupKey = this.findERC20GroupKey(
          erc20Asset.recommendedSymbol,
          currency.coinGeckoId,
          tokensMap,
        );

        this.addTokenToGroup(groupKey, viewToken, tokensMap);
        processedTokens.set(viewToken, true);
      }
    }

    // ETH
    for (const viewToken of allKnownBalances) {
      if (processedTokens.has(viewToken)) {
        continue;
      }

      const currency = viewToken.token.currency;
      if (currency.coinDenom === "ETH" && currency.coinGeckoId === "ethereum") {
        const groupKey = `${currency.coinGeckoId}`;
        this.addTokenToGroup(groupKey, viewToken, tokensMap);
        processedTokens.set(viewToken, true);
      }
    }

    // Unknown
    for (const viewToken of allKnownBalances) {
      if (processedTokens.has(viewToken)) {
        continue;
      }

      const currency = viewToken.token.currency;
      const chainId = viewToken.chainInfo.chainId;
      const coinMinimalDenom = currency.coinMinimalDenom;

      this.addTokenToGroup(
        `${chainId}/${coinMinimalDenom}`,
        viewToken,
        tokensMap,
      );
    }

    for (const tokens of tokensMap.values()) {
      tokens.sort(this.sortByPrice);
    }

    const sortedEntries = Array.from(tokensMap.entries()).sort(
      ([, tokensA], [, tokensB]) => this.sortTokenGroups(tokensA, tokensB),
    );

    return new Map(sortedEntries);
  }

  protected sortTokenGroups = (
    tokensA: ViewToken[],
    tokensB: ViewToken[],
  ): number => {
    let valueA = new Dec(0);
    let valueB = new Dec(0);

    let aHasBalance = false;
    let bHasBalance = false;

    for (const token of tokensA) {
      if (token.price) {
        valueA = valueA.add(token.price.toDec());
      }

      if (
        (!token.price ||
          token.price.toDec().equals(HugeQueriesStore.zeroDec)) &&
        token.token.toDec().gt(HugeQueriesStore.zeroDec)
      ) {
        aHasBalance = true;
      }
    }

    for (const token of tokensB) {
      if (token.price) {
        valueB = valueB.add(token.price.toDec());
      }

      if (
        (!token.price ||
          token.price.toDec().equals(HugeQueriesStore.zeroDec)) &&
        token.token.toDec().gt(HugeQueriesStore.zeroDec)
      ) {
        bHasBalance = true;
      }
    }

    if (valueA.equals(valueB)) {
      if (valueA.equals(HugeQueriesStore.zeroDec)) {
        if (aHasBalance && !bHasBalance) {
          return -1;
        } else if (!aHasBalance && bHasBalance) {
          return 1;
        } else {
          return 0;
        }
      }
      return 0;
    } else if (valueA.gt(valueB)) {
      return -1;
    } else {
      return 1;
    }
  };

  protected getIBCAssetForToken = computedFn(
    (currency: IBCCurrency): Asset | undefined => {
      const originChainId = currency.originChainId;
      const coinMinimalDenom = currency.originCurrency?.coinMinimalDenom;

      if (!originChainId || !coinMinimalDenom) {
        return undefined;
      }

      return this.skipQueriesStore.queryAssets
        .getAssets(originChainId)
        .assetsRaw.find((asset) => asset.originDenom === coinMinimalDenom);
    },
  );

  protected getErc20AssetForToken = computedFn(
    (chainId: string, currency: AppCurrency): Asset | undefined => {
      if (!currency.coinMinimalDenom.startsWith("erc20:")) {
        return undefined;
      }

      return this.skipQueriesStore.queryAssets
        .getAssets(chainId)
        .assetsRaw.find(
          (asset) =>
            asset.tokenContract?.toLowerCase() ===
            currency.coinMinimalDenom.split(":")[1].toLowerCase(),
        );
    },
  );

  protected findERC20GroupKey(
    recommendedSymbol: string,
    coinGeckoId: string,
    tokensMap: Map<string, ViewToken[]>,
  ): string {
    for (const [key, viewTokens] of tokensMap.entries()) {
      if (viewTokens.length === 0) continue;

      const tokenCurrency = viewTokens[0].token.currency;

      if ("paths" in tokenCurrency) {
        const ibcAsset = this.getIBCAssetForToken(tokenCurrency);

        if (
          ibcAsset?.recommendedSymbol === recommendedSymbol &&
          tokenCurrency.coinGeckoId === coinGeckoId
        ) {
          return key;
        }
      }
    }

    return `erc20:${recommendedSymbol}/${coinGeckoId}`;
  }

  protected findGroupKeyByCoinGeckoId(
    coinGeckoId: string,
    tokensMap: Map<string, ViewToken[]>,
  ): string {
    for (const [key, viewTokens] of tokensMap.entries()) {
      if (viewTokens.length === 0) continue;

      if (viewTokens[0].token.currency.coinGeckoId === coinGeckoId) {
        return key;
      }
    }

    return coinGeckoId;
  }

  protected addTokenToGroup(
    groupKey: string,
    token: ViewToken,
    tokensMap: Map<string, ViewToken[]>,
  ): void {
    if (!tokensMap.has(groupKey)) {
      tokensMap.set(groupKey, []);
    }

    tokensMap.get(groupKey)!.push(token);
  }
}
