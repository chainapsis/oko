import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { ModularChainInfo } from "@oko-wallet-user-dashboard/strores/chain/chain-info";
import { ViewToken } from "@oko-wallet-user-dashboard/strores/huge-queries";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { Toggle } from "@oko-wallet-common-ui/toggle/toggle";
import { ChevronDownIcon } from "@oko-wallet-common-ui/icons/chevron_down";

import styles from "./chain_item.module.scss";

interface ChainItemProps {
  chainInfo: ModularChainInfo;
  tokens?: ViewToken[];
}

export const ChainItem: FunctionComponent<ChainItemProps> = observer(
  ({ chainInfo, tokens }) => {
    const { chainStore } = useRootStore();
    const [isExpanded, setIsExpanded] = useState(false);

    const isEnabled = chainStore.isEnabledChain(chainInfo.chainId);
    const imageUrl =
      "chainSymbolImageUrl" in chainInfo
        ? chainInfo.chainSymbolImageUrl
        : undefined;

    const hasTokens = !!tokens?.length;

    const handleToggle = (checked: boolean) => {
      if (checked) {
        chainStore.enableChainInfoInUI(chainInfo.chainId);
      } else {
        chainStore.disableChainInfoInUI(chainInfo.chainId);
      }
    };

    const handleTokensClick = (e: React.MouseEvent) => {
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
                    {tokens.length} {tokens.length > 1 ? "tokens" : "token"}
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
            {tokens?.map((viewToken) => (
              <TokenItem
                key={viewToken.token.currency.coinMinimalDenom}
                viewToken={viewToken}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
);

interface TokenItemProps {
  viewToken: ViewToken;
}

const TokenItem: FunctionComponent<TokenItemProps> = ({ viewToken }) => {
  const currency = viewToken.token.currency;

  const imageUrl = currency.coinImageUrl;

  const coinDenom =
    "originCurrency" in currency && currency.originCurrency
      ? currency.originCurrency.coinDenom
      : currency.coinDenom;

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
      </div>
    </div>
  );
};
