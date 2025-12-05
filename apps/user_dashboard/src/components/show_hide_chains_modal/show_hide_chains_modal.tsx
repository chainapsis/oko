import { FC, ReactNode, useCallback, useState } from "react";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { Card } from "@oko-wallet-common-ui/card/card";
import { XCloseIcon } from "@oko-wallet-common-ui/icons/x_close";
import { Button } from "@oko-wallet-common-ui/button/button";
import { SearchIcon } from "@oko-wallet-common-ui/icons/search";
import { observer } from "mobx-react-lite";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { CoinPretty, Dec } from "@keplr-wallet/unit";

import styles from "./show_hide_chains_modal.module.scss";
import { Spacing } from "@oko-wallet-common-ui/spacing/spacing";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { ModularChainInfo } from "@oko-wallet-user-dashboard/strores/chain/chain-info";
import { ShowHideChainsFilters } from "./components/filters";
import { useSearch } from "@oko-wallet-user-dashboard/hooks/use_search";
import { ChainItem } from "./components/chain_item";

interface ShowHideChainsModalProps {
  renderTrigger: (props: { onOpen: () => void }) => ReactNode;
}

export const ShowHideChainsModal: FC<ShowHideChainsModalProps> = observer(
  ({ renderTrigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    const { chainStore, hugeQueriesStore, accountStore, queriesStore } =
      useRootStore();

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
      chainStore.modularChainInfos,
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
        const account = accountStore.getAccount(modularChainInfo.chainId);
        const baseChainId = modularChainInfo.chainId;

        const tokens =
          tokensByChainIdentifier.get(
            ChainIdHelper.parse(baseChainId).identifier,
          ) ?? [];

        const balance = (() => {
          if (
            "evm" in modularChainInfo &&
            chainStore.isEvmOnlyChain(modularChainInfo.chainId)
          ) {
            const queries = queriesStore.get(modularChainInfo.chainId);
            const mainCurrency = modularChainInfo.evm.currencies[0];

            const queryBalance =
              queries.queryBalances.getQueryEthereumHexAddress(
                account.ethereumHexAddress,
              );
            const balance = queryBalance.getBalance(mainCurrency);
            if (balance) {
              return balance.balance;
            }

            return new CoinPretty(mainCurrency, "0");
          } else if ("cosmos" in modularChainInfo) {
            const queries = queriesStore.get(modularChainInfo.chainId);
            const mainCurrency =
              modularChainInfo.cosmos.stakeCurrency ||
              modularChainInfo.cosmos.currencies[0];

            const queryBalance = queries.queryBalances.getQueryBech32Address(
              account.bech32Address,
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
      [accountStore, chainStore, queriesStore, tokensByChainIdentifier],
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
                  {({ showHiddenChains, ecosystem }) =>
                    searchedNativeModularChainInfos
                      .filter((chain) => "cosmos" in chain || "evm" in chain)
                      .filter((chain) => {
                        switch (showHiddenChains) {
                          case "Show All": {
                            return true;
                          }
                          case "Enabled": {
                            return chainStore.isEnabledChain(chain.chainId);
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
                        />
                      ))
                  }
                </ShowHideChainsFilters>

                <Spacing height={24} />

                <Button variant="primary" size="lg" fullWidth>
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
