"use client";

import { FC, ReactNode, useState } from "react";
import cn from "classnames";
import { observer } from "mobx-react-lite";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { Card } from "@oko-wallet-common-ui/card/card";
import { XCloseIcon } from "@oko-wallet-common-ui/icons/x_close";
import { SearchIcon } from "@oko-wallet-common-ui/icons/search";
import { Dropdown } from "@oko-wallet-common-ui/dropdown/dropdown";
import { ChevronDownIcon } from "@oko-wallet-common-ui/icons/chevron_down";
import { CopyOutlinedIcon } from "@oko-wallet-common-ui/icons/copy_outlined";
import { CheckCircleOutlinedIcon } from "@oko-wallet-common-ui/icons/check_circle_outlined";
import { QrCodeIcon } from "@oko-wallet-common-ui/icons/qr_code_icon";
import { EmptyStateIcon } from "@oko-wallet-common-ui/icons/empty_state_icon";
import { Spacing } from "@oko-wallet-common-ui/spacing/spacing";

import styles from "./deposit_modal.module.scss";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { ModularChainInfo } from "@oko-wallet-user-dashboard/strores/chain/chain-info";
import { useSearch } from "@oko-wallet-user-dashboard/hooks/use_search";
import { AddressQrModal } from "@oko-wallet-user-dashboard/components/address_qr_modal/address_qr_modal";
import { AddressItem } from "./components/address_item";

const ecosystemFilterOptions = ["All Chains", "Cosmos", "EVM"] as const;
type EcosystemFilter = (typeof ecosystemFilterOptions)[number];

interface DepositModalProps {
  renderTrigger: (props: { onOpen: () => void }) => ReactNode;
}

export const DepositModal: FC<DepositModalProps> = observer(
  ({ renderTrigger }) => {
    const { chainStore, okoWalletAddressStore } = useRootStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false); // Note: hide modal when qr modal is open
    const [searchQuery, setSearchQuery] = useState("");
    const [ecosystem, setEcosystem] = useState<EcosystemFilter>("All Chains");

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const hideModal = () => setIsHidden(true);
    const showModal = () => setIsHidden(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    const searchFields = ["chainName"];

    const searchedChainInfos = useSearch(
      chainStore.modularChainInfosInUI.filter(
        (chain) => "cosmos" in chain || "evm" in chain,
      ),
      searchQuery,
      searchFields,
    );

    const filteredChainInfos = searchedChainInfos.filter((chain) => {
      switch (ecosystem) {
        case "All Chains":
          return true;
        case "Cosmos":
          return "cosmos" in chain;
        case "EVM":
          return "evm" in chain;
      }
    });

    const getAddressForChain = (
      chain: ModularChainInfo,
    ): string | undefined => {
      if ("evm" in chain) {
        return okoWalletAddressStore.getEthAddress();
      }
      return okoWalletAddressStore.getBech32Address(chain.chainId);
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
                        <Typography
                          size="sm"
                          color="secondary"
                          weight="semibold"
                        >
                          {ecosystem}
                        </Typography>
                        <ChevronDownIcon
                          color="var(--fg-quaternary)"
                          size={20}
                        />
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
  },
);
