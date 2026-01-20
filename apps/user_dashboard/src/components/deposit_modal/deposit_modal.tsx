"use client";

import {
  type ChangeEvent,
  type FC,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import cn from "classnames";

import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Card } from "@oko-wallet/oko-common-ui/card";
import { XCloseIcon } from "@oko-wallet/oko-common-ui/icons/x_close";
import { SearchIcon } from "@oko-wallet/oko-common-ui/icons/search";
import { Dropdown } from "@oko-wallet/oko-common-ui/dropdown";
import { ChevronDownIcon } from "@oko-wallet/oko-common-ui/icons/chevron_down";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { useEnabledChains } from "@oko-wallet-user-dashboard/hooks/queries";
import {
  useEthAddress,
  useBech32Addresses,
} from "@oko-wallet-user-dashboard/hooks/queries/use_addresses";
import type { ModularChainInfo } from "@oko-wallet-user-dashboard/types/chain";
import { useSearch } from "@oko-wallet-user-dashboard/hooks/use_search";
import { isCosmosChainId } from "@oko-wallet-user-dashboard/utils/chain";

import styles from "./deposit_modal.module.scss";
import { AddressItem } from "./components/address_item";

const ecosystemFilterOptions = ["All Chains", "Cosmos", "EVM"] as const;
type EcosystemFilter = (typeof ecosystemFilterOptions)[number];

interface DepositModalProps {
  renderTrigger: (props: { onOpen: () => void }) => ReactNode;
}

export const DepositModal: FC<DepositModalProps> = ({ renderTrigger }) => {
  const { chains: enabledChains } = useEnabledChains();

  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false); // Note: hide modal when qr modal is open
  const [searchQuery, setSearchQuery] = useState("");
  const [ecosystem, setEcosystem] = useState<EcosystemFilter>("All Chains");

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const hideModal = () => setIsHidden(true);
  const showModal = () => setIsHidden(false);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const searchFields = ["chainName"];

  // Get enabled chains with cosmos or evm modules
  const visibleChains = useMemo(() => {
    return enabledChains.filter((chain) => chain.cosmos || chain.evm);
  }, [enabledChains]);

  // Get addresses using TanStack Query hooks
  const { address: ethAddress } = useEthAddress();
  const cosmosChainIds = useMemo(
    () =>
      visibleChains
        .filter((chain) => isCosmosChainId(chain.chainId))
        .map((chain) => chain.chainId),
    [visibleChains],
  );
  const { addresses: bech32Addresses } = useBech32Addresses(cosmosChainIds);

  const searchedChainInfos = useSearch(
    visibleChains,
    searchQuery,
    searchFields,
  );

  const filteredChainInfos = searchedChainInfos.filter((chain) => {
    switch (ecosystem) {
      case "All Chains":
        return true;
      case "Cosmos":
        return !!chain.cosmos;
      case "EVM":
        return !!chain.evm;
    }
  });

  const getAddressForChain = (chain: ModularChainInfo): string | undefined => {
    if (chain.evm) {
      return ethAddress;
    }
    return bech32Addresses[chain.chainId];
  };

  return (
    <>
      {renderTrigger({ onOpen })}

      {isOpen && (
        <div
          className={cn(styles.modalBackground, {
            [styles.hidden]: isHidden,
          })}
          onClick={onClose}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Card
              className={styles.modalCard}
              variant="elevated"
              padding="none"
            >
              <div className={styles.modalContent}>
                <div className={styles.header}>
                  <Typography size="md" weight="semibold" color="primary">
                    Deposit
                  </Typography>
                  <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <XCloseIcon color="var(--fg-quaternary)" size={20} />
                  </button>
                </div>

                <div className={styles.searchBar}>
                  <SearchIcon color="var(--fg-quaternary)" size={16} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search Chains"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    name="search-chains"
                  />
                </div>
              </div>

              <Typography size="sm" weight="semibold" color="secondary">
                Filters
              </Typography>
              <Spacing height={8} />

              <div className={styles.filterWrapper}>
                <Dropdown>
                  <Dropdown.Trigger asChild>
                    <div className={styles.dropdownTrigger}>
                      <Typography size="sm" color="secondary" weight="semibold">
                        {ecosystem}
                      </Typography>
                      <ChevronDownIcon color="var(--fg-quaternary)" size={20} />
                    </div>
                  </Dropdown.Trigger>
                  <Dropdown.Content className={styles.dropdownContent}>
                    {ecosystemFilterOptions.map((option) => (
                      <Dropdown.Item
                        key={option}
                        onClick={() => setEcosystem(option)}
                      >
                        {option}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Content>
                </Dropdown>
              </div>

              <div className={cn(styles.chainList, "common-list-scroll")}>
                {filteredChainInfos.map((chain) => (
                  <AddressItem
                    key={chain.chainId}
                    chainInfo={chain}
                    address={getAddressForChain(chain)}
                    onQrModalOpen={hideModal}
                    onQrModalClose={showModal}
                  />
                ))}
              </div>

              <Spacing height={8} />
            </Card>
          </div>
        </div>
      )}
    </>
  );
};
