"use client";

import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { CopyOutlinedIcon } from "@oko-wallet-common-ui/icons/copy_outlined";
import { CheckCircleOutlinedIcon } from "@oko-wallet-common-ui/icons/check_circle_outlined";
import { Skeleton } from "@oko-wallet-common-ui/skeleton/skeleton";
import { EmptyStateIcon } from "@oko-wallet-common-ui/icons/empty_state_icon";
import { Tooltip } from "@oko-wallet-common-ui/tooltip/tooltip";

import styles from "./token_item.module.scss";
import { ViewToken } from "@oko-wallet-user-dashboard/strores/huge-queries";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";

interface TokenItemProps {
  viewToken: ViewToken;
  copyAddress?: string;
  onClick?: () => void;
  disabled?: boolean;
  isNotReady?: boolean;
}

export const TokenItem: FunctionComponent<TokenItemProps> = observer(
  ({ viewToken, copyAddress, onClick, disabled, isNotReady }) => {
    const { priceStore } = useRootStore();
    const [isCopied, setIsCopied] = useState(false);

    const pricePretty = priceStore.calculatePrice(viewToken.token);
    const currency = viewToken.token.currency;

    const imageUrl = currency.coinImageUrl;
    const coinDenom =
      "originCurrency" in currency && currency.originCurrency
        ? currency.originCurrency.coinDenom
        : currency.coinDenom;

    const handleCopyAddress = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!copyAddress) return;

      try {
        await navigator.clipboard.writeText(copyAddress);
        setIsCopied(true);
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
                      .maxDecimals(2)
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

          {/* Copy Address Button */}
          {copyAddress && !isNotReady && (
            <button
              className={`${styles.copyButton}`}
              onClick={handleCopyAddress}
              type="button"
            >
              {isCopied ? (
                <CheckCircleOutlinedIcon
                  size={16}
                  color="var(--fg-success-primary)"
                />
              ) : (
                <CopyOutlinedIcon size={16} color="var(--fg-tertiary)" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  },
);
