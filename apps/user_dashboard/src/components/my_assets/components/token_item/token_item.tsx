"use client";

import { type FunctionComponent, type MouseEvent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { CopyOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/copy_outlined";
import { CheckCircleOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/check_circle_outlined";
import { QrCodeIcon } from "@oko-wallet/oko-common-ui/icons/qr_code_icon";
import { Skeleton } from "@oko-wallet/oko-common-ui/skeleton";
import { EmptyStateIcon } from "@oko-wallet/oko-common-ui/icons/empty_state_icon";
import { Tooltip } from "@oko-wallet/oko-common-ui/tooltip";
import { Badge } from "@oko-wallet/oko-common-ui/badge";

import styles from "./token_item.module.scss";
import type { ViewToken } from "@oko-wallet-user-dashboard/store_legacy/huge-queries";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { AddressQrModal } from "@oko-wallet-user-dashboard/components/address_qr_modal/address_qr_modal";
import { displayToast } from "@oko-wallet-user-dashboard/components/toast";

interface TokenItemProps {
  viewToken: ViewToken;
  address?: string;
  onClick?: () => void;
  disabled?: boolean;
  isNotReady?: boolean;
}

export const TokenItem: FunctionComponent<TokenItemProps> = observer(
  ({ viewToken, address, onClick, disabled, isNotReady }) => {
    const { priceStore } = useRootStore();
    const [isCopied, setIsCopied] = useState(false);

    const pricePretty = priceStore.calculatePrice(viewToken.token);
    const currency = viewToken.token.currency;

    const imageUrl = currency.coinImageUrl;
    const coinDenom =
      "originCurrency" in currency && currency.originCurrency
        ? currency.originCurrency.coinDenom
        : currency.coinDenom;

    const isIBC = viewToken.token.currency.coinMinimalDenom.startsWith("ibc/");

    const handleCopyAddress = async (e: MouseEvent) => {
      e.stopPropagation();
      if (!address) return;

      try {
        await navigator.clipboard.writeText(address);
        setIsCopied(true);

        displayToast({
          variant: "success",
          title: "Copied",
        });
        setTimeout(() => setIsCopied(false), 1500);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    };

    const handleClick = () => {
      if (disabled || !onClick) return;
      onClick();
    };

    return (
      <div
        className={`${styles.container} ${disabled ? styles.disabled : ""} ${onClick ? styles.clickable : ""}`}
        onClick={handleClick}
      >
        <div className={styles.leftSection}>
          {/* Token Image */}
          {isNotReady ? (
            <Skeleton width={28} height={28} borderRadius="50%" />
          ) : imageUrl ? (
            <img src={imageUrl} alt={coinDenom} className={styles.tokenImage} />
          ) : (
            <EmptyStateIcon size={28} />
          )}

          {/* Token Info */}
          <div className={styles.tokenInfo}>
            <div className={styles.tokenNameRow}>
              {isNotReady ? (
                <Skeleton width={60} height={16} />
              ) : (
                <Typography size="sm" weight="medium" color="secondary">
                  {coinDenom}
                </Typography>
              )}
              {isIBC && (
                <Badge type="pill" size="sm" color="gray" label="IBC" />
              )}
              {viewToken.isFetching && !isNotReady && (
                <div className={styles.loadingIndicator} />
              )}
              {viewToken.error && !isNotReady && (
                <Tooltip
                  content={viewToken.error.message || "Error loading token"}
                >
                  <div className={styles.errorIndicator}>!</div>
                </Tooltip>
              )}
            </div>
            <div className={styles.chainNameRow}>
              {isNotReady ? (
                <Skeleton width={80} height={14} />
              ) : (
                <Typography size="xs" weight="medium" color="tertiary">
                  {viewToken.chainInfo.chainName}
                </Typography>
              )}
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          {/* Balance & Price */}
          {
            <div className={styles.balanceInfo}>
              {isNotReady ? (
                <>
                  <Skeleton width={60} height={16} />
                  <Skeleton width={50} height={14} />
                </>
              ) : (
                <>
                  <Typography size="sm" weight="medium" color="secondary">
                    {viewToken.token
                      .hideDenom(true)
                      .maxDecimals(4)
                      .shrink(true)
                      .toString()}
                  </Typography>
                  <Typography size="xs" weight="medium" color="tertiary">
                    {pricePretty ? pricePretty.toString() : "-"}
                  </Typography>
                </>
              )}
            </div>
          }

          {/* Copy Address and QR Code Buttons */}
          {address && !isNotReady && (
            <>
              <button
                className={`${styles.copyButton}`}
                onClick={handleCopyAddress}
                type="button"
              >
                {isCopied ? (
                  <CheckCircleOutlinedIcon
                    size={16}
                    color="var(--fg-tertiary)"
                  />
                ) : (
                  <CopyOutlinedIcon size={16} color="var(--fg-tertiary)" />
                )}
              </button>

              <AddressQrModal
                renderTrigger={({ onOpen }) => (
                  <button className={`${styles.copyButton}`} onClick={onOpen}>
                    <QrCodeIcon size={16} color="var(--fg-tertiary)" />
                  </button>
                )}
                chainInfo={viewToken.chainInfo}
                address={address}
              />
            </>
          )}
        </div>
      </div>
    );
  },
);
