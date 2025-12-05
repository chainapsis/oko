import { FC, ReactNode, useCallback, useRef, useState } from "react";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { Card } from "@oko-wallet-common-ui/card/card";
import { XCloseIcon } from "@oko-wallet-common-ui/icons/x_close";
import { Button } from "@oko-wallet-common-ui/button/button";
import { SearchIcon } from "@oko-wallet-common-ui/icons/search";
import { observer } from "mobx-react-lite";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { CoinPretty } from "@keplr-wallet/unit";
import cn from "classnames";

import styles from "./show_hide_chains_modal.module.scss";
import { Spacing } from "@oko-wallet-common-ui/spacing/spacing";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { ModularChainInfo } from "@oko-wallet-user-dashboard/strores/chain/chain-info";
import { ShowHideChainsFilters } from "./components/filters";
import { useSearch } from "@oko-wallet-user-dashboard/hooks/use_search";
import { ChainItem } from "./components/chain_item";
import { useSDKState } from "@oko-wallet-user-dashboard/state/sdk";

interface ShowHideChainsModalProps {
  renderTrigger: (props: { onOpen: () => void }) => ReactNode;
}

export const ShowHideChainsModal: FC<ShowHideChainsModalProps> = observer(
  ({ renderTrigger }) => {
    const okoCosmos = useSDKState((state) => state.oko_cosmos);
    const okoEth = useSDKState((state) => state.oko_eth);

    const { chainStore, hugeQueriesStore, queriesStore } = useRootStore();

    const chainIdsToEnable = useRef<Set<string>>(new Set());
    const chainIdsToDisable = useRef<Set<string>>(new Set());

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const onSave = () => {
      chainStore.enableChainInfoInUI(...chainIdsToEnable.current);
      chainStore.disableChainInfoInUI(...chainIdsToDisable.current);
      onClose();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    const searchFields = [
      "chainName",
      {
        key: "modularChainInfo.currency.coinDenom",
        function: (modularChainInfo: ModularChainInfo) => {
          if ("cosmos" in modularChainInfo) {
            return CoinPretty.makeCoinDenomPretty(
              (
                modularChainInfo.cosmos.stakeCurrency ||
                modularChainInfo.cosmos.currencies[0]
              ).coinDenom,
            );
          } else if (chainStore.hasModularChain(modularChainInfo.chainId)) {
            const denom = chainStore
              .getModularChainInfoImpl(modularChainInfo.chainId)
              .getCurrencies()?.[0].coinDenom;

            return CoinPretty.makeCoinDenomPretty(denom) ?? "";
          }
          return "";
        },
      },
    ];

    const searchedNativeModularChainInfos = useSearch(
      chainStore.modularChainInfos.filter(
        (chain) => "cosmos" in chain || "evm" in chain,
      ),
      searchQuery,
      searchFields,
    );

    const tokensByChainIdentifier =
      hugeQueriesStore.allTokenMapByChainIdentifier;

    const getChainItemInfoForView = useCallback(
      (
        modularChainInfo: ModularChainInfo & {
          linkedModularChainInfos?: ModularChainInfo[];
        },
      ) => {
        const baseChainId = modularChainInfo.chainId;

        const tokens =
          tokensByChainIdentifier.get(
            ChainIdHelper.parse(baseChainId).identifier,
          ) ?? [];

        const balance = (async () => {
          if (
            "evm" in modularChainInfo &&
            chainStore.isEvmOnlyChain(modularChainInfo.chainId)
          ) {
            const ethAddress = await okoEth?.getAddress();

            const queries = queriesStore.get(modularChainInfo.chainId);
            const mainCurrency = modularChainInfo.evm.currencies[0];

            const queryBalance =
              queries.queryBalances.getQueryEthereumHexAddress(
                ethAddress ?? "",
              );
            const balance = queryBalance.getBalance(mainCurrency);
            if (balance) {
              return balance.balance;
            }

            return new CoinPretty(mainCurrency, "0");
          } else if ("cosmos" in modularChainInfo) {
            const cosmosAccount = await okoCosmos?.getKey(
              modularChainInfo.chainId,
            );

            const queries = queriesStore.get(modularChainInfo.chainId);
            const mainCurrency =
              modularChainInfo.cosmos.stakeCurrency ||
              modularChainInfo.cosmos.currencies[0];

            const queryBalance = queries.queryBalances.getQueryBech32Address(
              cosmosAccount?.bech32Address ?? "",
            );
            const balance = queryBalance.getBalance(mainCurrency);

            if (balance) {
              return balance.balance;
            }

            return new CoinPretty(mainCurrency, "0");
          }
        })();

        const chainIdentifier = ChainIdHelper.parse(
          modularChainInfo.chainId,
        ).identifier;

        return {
          balance,
          tokens,
          chainIdentifier,
        };
      },
      [chainStore, queriesStore, tokensByChainIdentifier],
    );

    return (
      <>
        {renderTrigger({ onOpen })}

        {isOpen && (
          <div className={styles.modalBackground} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <Card
                className={styles.modalCard}
                variant="elevated"
                padding="none"
              >
                <div className={styles.modalContent}>
                  <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <XCloseIcon color="var(--fg-quaternary)" size={20} />
                  </button>

                  <div className={styles.searchBar}>
                    <SearchIcon color="var(--fg-quaternary)" size={16} />
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search Assets or Chains"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      name="search-assets-chains"
                    />
                  </div>
                </div>

                <Typography size="sm" weight="semibold" color="secondary">
                  Filters
                </Typography>
                <Spacing height={8} />

                <ShowHideChainsFilters>
                  {({ visibility, ecosystem }) => (
                    <div className={cn(styles.chainList, "common-list-scroll")}>
                      {searchedNativeModularChainInfos

                        .filter((chain) => {
                          switch (visibility) {
                            case "Show All": {
                              return true;
                            }
                            case "Show Hidden": {
                              return !chainStore.isEnabledChain(chain.chainId);
                            }
                          }
                        })
                        .filter((chain) => {
                          switch (ecosystem) {
                            case "All Chains": {
                              return true;
                            }
                            case "Cosmos": {
                              return "cosmos" in chain;
                            }
                            case "EVM": {
                              return "evm" in chain;
                            }
                          }
                        })
                        .map((chain) => (
                          <ChainItem
                            key={chain.chainId}
                            chainInfo={chain as ModularChainInfo}
                            tokens={getChainItemInfoForView(chain).tokens}
                            onEnable={(checked) =>
                              checked
                                ? chainIdsToEnable.current.add(chain.chainId)
                                : chainIdsToDisable.current.add(chain.chainId)
                            }
                          />
                        ))}
                    </div>
                  )}
                </ShowHideChainsFilters>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className={styles.saveButton}
                  onClick={onSave}
                >
                  Save
                </Button>

                <Spacing height={8} />
              </Card>
            </div>
          </div>
        )}
      </>
    );
  },
);
