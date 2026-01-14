import {
  type FunctionComponent,
  type MouseEvent,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Toggle } from "@oko-wallet/oko-common-ui/toggle";
import { ChevronDownIcon } from "@oko-wallet/oko-common-ui/icons/chevron_down";
import { Badge } from "@oko-wallet/oko-common-ui/badge";

import styles from "./chain_item.module.scss";
import type { TokenBalance } from "@oko-wallet-user-dashboard/types/token";
import type { ModularChainInfo } from "@oko-wallet-user-dashboard/types/chain";
import { useChainStore } from "@oko-wallet-user-dashboard/state/chains";

interface ChainItemProps {
  chainInfo: ModularChainInfo;
  getTokenBalances: (chainId: string) => TokenBalance[];
  onEnable: (chainId: string, checked: boolean) => void;
}

export const ChainItem: FunctionComponent<ChainItemProps> = memo(
  ({ chainInfo, getTokenBalances, onEnable }) => {
    const isChainEnabled = useChainStore((state) => state.isChainEnabled);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEnabled, setIsEnabled] = useState(() =>
      isChainEnabled(chainInfo.chainId)
    );

    const tokenBalances = useMemo(
      () =>
        getTokenBalances(chainInfo.chainId).filter(
          (bal) => BigInt(bal.token.amount) > BigInt(0)
        ),
      [getTokenBalances, chainInfo.chainId]
    );

    const imageUrl = chainInfo.chainSymbolImageUrl;
    const hasTokens = tokenBalances.length > 0;

    const handleToggle = useCallback(
      (checked: boolean) => {
        setIsEnabled(checked);
        onEnable(chainInfo.chainId, checked);
      },
      [chainInfo.chainId, onEnable]
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
                    {tokenBalances.length}{" "}
                    {tokenBalances.length > 1 ? "tokens" : "token"}
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
            {tokenBalances.map((tokenBalance) => (
              <FoldableTokenItem
                key={tokenBalance.token.currency.coinMinimalDenom}
                tokenBalance={tokenBalance}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

interface FoldableTokenItemProps {
  tokenBalance: TokenBalance;
}

const FoldableTokenItem: FunctionComponent<FoldableTokenItemProps> = ({
  tokenBalance,
}) => {
  const currency = tokenBalance.token.currency;

  const imageUrl = currency.coinImageUrl;
  const coinDenom = currency.coinDenom;

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
