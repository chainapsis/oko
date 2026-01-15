import {
  type ChangeEvent,
  type FC,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import cn from "classnames";

import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Card } from "@oko-wallet/oko-common-ui/card";
import { XCloseIcon } from "@oko-wallet/oko-common-ui/icons/x_close";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { SearchIcon } from "@oko-wallet/oko-common-ui/icons/search";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { useChainStore, getChainIdentifier } from "@oko-wallet-user-dashboard/state/chains";
import { useAllBalances, useChains } from "@oko-wallet-user-dashboard/hooks/queries";
import type { ModularChainInfo } from "@oko-wallet-user-dashboard/types/chain";
import type { TokenBalance } from "@oko-wallet-user-dashboard/types/token";
import { useSearch } from "@oko-wallet-user-dashboard/hooks/use_search";

import styles from "./show_hide_chains_modal.module.scss";
import { ShowHideChainsFilters } from "./components/filters";
import { ChainItem } from "./components/chain_item";

interface ShowHideChainsModalProps {
  renderTrigger: (props: { onOpen: () => void }) => ReactNode;
}

export const ShowHideChainsModal: FC<ShowHideChainsModalProps> = ({
  renderTrigger,
}) => {
  const { chains } = useChains();
  const isChainEnabled = useChainStore((state) => state.isChainEnabled);
  const enableChains = useChainStore((state) => state.enableChains);
  const disableChains = useChainStore((state) => state.disableChains);

  const { balancesByChainIdentifier } = useAllBalances();

  const chainIdsToEnable = useRef<Set<string>>(new Set());
  const chainIdsToDisable = useRef<Set<string>>(new Set());

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const onSave = () => {
    enableChains(...chainIdsToEnable.current);
    disableChains(...chainIdsToDisable.current);
    chainIdsToEnable.current.clear();
    chainIdsToDisable.current.clear();
    onClose();
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter chains that have cosmos or evm modules
  const visibleChains = useMemo(() => {
    return chains.filter((chain) => chain.cosmos || chain.evm);
  }, [chains]);

  // Search configuration
  const searchFields = useMemo(
    () => [
      "chainName",
      {
        key: "currency",
        function: (chain: ModularChainInfo) => {
          if (chain.cosmos) {
            return (
              chain.cosmos.stakeCurrency?.coinDenom ||
              chain.cosmos.currencies[0]?.coinDenom ||
              ""
            );
          }
          if (chain.evm) {
            return chain.evm.currencies[0]?.coinDenom || "";
          }
          return "";
        },
      },
    ],
    []
  );

  const searchedChains = useSearch(visibleChains, searchQuery, searchFields);

  const sortedSearchedChains = useMemo(() => {
    return [...searchedChains].sort((a, b) => {
      const aIsEnabled = isChainEnabled(a.chainId);
      const bIsEnabled = isChainEnabled(b.chainId);
      if (aIsEnabled && !bIsEnabled) {
        return -1;
      }
      if (!aIsEnabled && bIsEnabled) {
        return 1;
      }

      const aIsTestnet = !!a.isTestnet;
      const bIsTestnet = !!b.isTestnet;

      if (aIsTestnet && !bIsTestnet) {
        return 1;
      } else if (!aIsTestnet && bIsTestnet) {
        return -1;
      }

      return a.chainName.localeCompare(b.chainName);
    });
  }, [searchedChains, isChainEnabled]);

  const getTokenBalances = useCallback(
    (chainId: string): TokenBalance[] => {
      return balancesByChainIdentifier.get(getChainIdentifier(chainId)) ?? [];
    },
    [balancesByChainIdentifier]
  );

  const handleEnable = useCallback((chainId: string, checked: boolean) => {
    if (checked) {
      chainIdsToEnable.current.add(chainId);
      chainIdsToDisable.current.delete(chainId);
    } else {
      chainIdsToDisable.current.add(chainId);
      chainIdsToEnable.current.delete(chainId);
    }
  }, []);

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
                    {sortedSearchedChains
                      .filter((chain) => {
                        switch (visibility) {
                          case "Show All": {
                            return true;
                          }
                          case "Show Hidden": {
                            return !isChainEnabled(chain.chainId);
                          }
                        }
                      })
                      .filter((chain) => {
                        switch (ecosystem) {
                          case "All Chains": {
                            return true;
                          }
                          case "Cosmos": {
                            return !!chain.cosmos;
                          }
                          case "EVM": {
                            return !!chain.evm;
                          }
                        }
                      })
                      .map((chain) => (
                        <ChainItem
                          key={chain.chainId}
                          chainInfo={chain}
                          getTokenBalances={getTokenBalances}
                          onEnable={handleEnable}
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
};
