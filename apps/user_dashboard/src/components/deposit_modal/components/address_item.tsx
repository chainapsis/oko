import { FC, useState } from "react";
import { CheckCircleOutlinedIcon } from "@oko-wallet-common-ui/icons/check_circle_outlined";
import { CopyOutlinedIcon } from "@oko-wallet-common-ui/icons/copy_outlined";
import { EmptyStateIcon } from "@oko-wallet-common-ui/icons/empty_state_icon";
import { QrCodeIcon } from "@oko-wallet-common-ui/icons/qr_code_icon";
import { Typography } from "@oko-wallet-common-ui/typography/typography";

import styles from "./address_item.module.scss";
import { AddressQrModal } from "@oko-wallet-user-dashboard/components/address_qr_modal/address_qr_modal";
import { ModularChainInfo } from "@oko-wallet-user-dashboard/strores/chain/chain-info";

interface AddressItemProps {
  chainInfo: ModularChainInfo;
  address?: string;
  onQrModalOpen?: () => void;
  onQrModalClose?: () => void;
}

export const AddressItem: FC<AddressItemProps> = ({
  chainInfo,
  address,
  onQrModalOpen,
  onQrModalClose,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const imageUrl = chainInfo.chainSymbolImageUrl;

  const truncateAddress = (addr: string) => {
    const LENGTH_OF_FIRST_PART = 10;
    const LENGTH_OF_LAST_PART = 6;

    if (addr.length <= LENGTH_OF_FIRST_PART + LENGTH_OF_LAST_PART) {
      return addr;
    }
    return `${addr.slice(0, LENGTH_OF_FIRST_PART)}...${addr.slice(-LENGTH_OF_LAST_PART)}`;
  };

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <div className={styles.addressItem}>
      <div className={styles.leftSection}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={chainInfo.chainName}
            className={styles.chainImage}
          />
        ) : (
          <EmptyStateIcon size={28} />
        )}

        <div className={styles.chainInfo}>
          <Typography size="sm" weight="medium" color="secondary">
            {chainInfo.chainName}
          </Typography>
          <Typography size="xs" weight="medium" color="tertiary">
            {address ? truncateAddress(address) : "Loading..."}
          </Typography>
        </div>
      </div>

      <div className={styles.rightSection}>
        {address && (
          <>
            <button
              className={styles.actionButton}
              onClick={handleCopyAddress}
              type="button"
            >
              {isCopied ? (
                <CheckCircleOutlinedIcon size={16} color="var(--fg-tertiary)" />
              ) : (
                <CopyOutlinedIcon size={16} color="var(--fg-tertiary)" />
              )}
            </button>

            <AddressQrModal
              renderTrigger={({ onOpen }) => (
                <button className={styles.actionButton} onClick={onOpen}>
                  <QrCodeIcon size={16} color="var(--fg-tertiary)" />
                </button>
              )}
              chainInfo={chainInfo}
              address={address}
              onOpenCallback={onQrModalOpen}
              onCloseCallback={onQrModalClose}
            />
          </>
        )}
      </div>
    </div>
  );
};
