import { observer } from "mobx-react-lite";
import {
  type FunctionComponent,
  type MouseEvent,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Dec } from "@keplr-wallet/unit";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Toggle } from "@oko-wallet/oko-common-ui/toggle/toggle";
import { ChevronDownIcon } from "@oko-wallet/oko-common-ui/icons/chevron_down";
import { Badge } from "@oko-wallet/oko-common-ui/badge/badge";

import styles from "./chain_item.module.scss";
import type { ViewToken } from "@oko-wallet-user-dashboard/store_legacy/huge-queries";
import type { ModularChainInfo } from "@oko-wallet-user-dashboard/store_legacy/chain/chain-info";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";

interface ChainItemProps {
  chainInfo: ModularChainInfo;
  getViewTokens: (chainId: string) => ViewToken[];
  onEnable: (chainId: string, checked: boolean) => void;
}

export const ChainItem: FunctionComponent<ChainItemProps> = memo(
  observer(({ chainInfo, getViewTokens, onEnable }) => {
    const { chainStore } = useRootStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEnabled, setIsEnabled] = useState(() =>
      chainStore.isEnabledChain(chainInfo.chainId),
    );

    const viewTokens = useMemo(
      () =>
        getViewTokens(chainInfo.chainId).filter((v) =>
          v.token.toDec().gt(new Dec(0)),
        ),
      [getViewTokens, chainInfo.chainId],
    );

    const imageUrl =
      "chainSymbolImageUrl" in chainInfo
        ? chainInfo.chainSymbolImageUrl
        : undefined;

    const hasTokens = viewTokens.length > 0;

    const handleToggle = useCallback(
      (checked: boolean) => {
        setIsEnabled(checked);
        onEnable(chainInfo.chainId, checked);
      },
      [chainInfo.chainId, onEnable],
    );

    const handleTokensClick = (e: MouseEvent) => {
      e.stopPropagation();
      if (hasTokens) {
        setIsExpanded(!isExpanded);
      }
    };

    return (
      <div className={styles.chainItemWrapper}>
        <div className={styles.chainItem}>
          <div className={styles.chainInfo}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={chainInfo.chainName}
                className={styles.chainImage}
              />
            ) : (
              <div className={styles.chainImagePlaceholder} />
            )}
            <div className={styles.chainDetails}>
              <Typography size="sm" weight="medium" color="secondary">
                {chainInfo.chainName}
              </Typography>
              {hasTokens && (
                <button
                  className={styles.tokensButton}
                  onClick={handleTokensClick}
                >
                  <Typography size="xs" weight="medium" color="tertiary">
                    {viewTokens.length}{" "}
                    {viewTokens.length > 1 ? "tokens" : "token"}
                  </Typography>
                  <ChevronDownIcon
                    size={12}
                    color="var(--fg-tertiary)"
                    className={`${styles.chevron} ${isExpanded ? styles.expanded : ""}`}
                  />
                </button>
              )}
            </div>
          </div>
          <Toggle checked={isEnabled} onChange={handleToggle} />
        </div>

        {/* Foldable Token List */}
        <div
          className={`${styles.tokenListWrapper} ${isExpanded ? styles.expanded : ""}`}
        >
          <div className={styles.tokenList}>
            {viewTokens.map((viewToken) => (
              <FoldableTokenItem
                key={viewToken.token.currency.coinMinimalDenom}
                viewToken={viewToken}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }),
);

interface FoldableTokenItemProps {
  viewToken: ViewToken;
}

const FoldableTokenItem: FunctionComponent<FoldableTokenItemProps> = ({
  viewToken,
}) => {
  const currency = viewToken.token.currency;

  const imageUrl = currency.coinImageUrl;

  const coinDenom =
    "originCurrency" in currency && currency.originCurrency
      ? currency.originCurrency.coinDenom
      : currency.coinDenom;

  const isIBC = currency.coinMinimalDenom.startsWith("ibc/");

  return (
    <div className={styles.tokenItem}>
      <div className={styles.tokenInfo}>
        {imageUrl ? (
          <img src={imageUrl} alt={coinDenom} className={styles.tokenImage} />
        ) : (
          <div className={styles.tokenImagePlaceholder} />
        )}
        <Typography size="xs" weight="medium" color="primary">
          {coinDenom}
        </Typography>
        {isIBC && <Badge type="pill" size="sm" color="gray" label="IBC" />}
      </div>
    </div>
  );
};
