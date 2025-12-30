import { type ChangeEvent, type FC, Fragment, useState } from "react";
import { observer } from "mobx-react-lite";
import { CoinPretty } from "@keplr-wallet/unit";
import { SearchIcon } from "@oko-wallet/oko-common-ui/icons/search";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { CheckCircleOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/check_circle_outlined";
import { ImageWithAlt } from "@oko-wallet/oko-common-ui/image_with_alt";

import styles from "./token_list.module.scss";
import { TokenItem } from "../token_item/token_item";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { useSearch } from "@oko-wallet-user-dashboard/hooks/use_search";
import type { ViewToken } from "@oko-wallet-user-dashboard/store_legacy/huge-queries";
import { ShowHideChainsModal } from "@oko-wallet-user-dashboard/components/show_hide_chains_modal/show_hide_chains_modal";

export const TokenList = observer(() => {
  const { hugeQueriesStore, chainStore, okoWalletAddressStore } =
    useRootStore();
  const tokens = hugeQueriesStore.getAllBalances({ allowIBCToken: true });

  const [searchQuery, setSearchQuery] = useState("");
  const [isHideLowBalance, setIsHideLowBalance] = useState(false);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const searchFields = [
    "chainInfo.chainName",
    {
      key: "token.currency.coinDenom",
      function: (viewToken: ViewToken) => {
        const currency = viewToken.token.currency;
        const coinDenom =
          "originCurrency" in currency && currency.originCurrency
            ? currency.originCurrency.coinDenom
            : currency.coinDenom;
        return CoinPretty.makeCoinDenomPretty(coinDenom);
      },
    },
  ];

  const searchedTokens = useSearch(
    [...tokens],
    searchQuery,
    searchFields,
    (token) => token.token.currency.coinMinimalDenom,
  );

  const hasLowBalanceTokens =
    isHideLowBalance &&
    hugeQueriesStore.filterLowBalanceTokens(tokens).lowBalanceTokens.length > 0;

  const balances = hasLowBalanceTokens
    ? hugeQueriesStore.filterLowBalanceTokens(searchedTokens).filteredTokens
    : searchedTokens;

  return (
    <>
      <div className={styles.searchBar}>
        <SearchIcon color="var(--fg-quaternary)" size={16} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search Assets or Chains"
          value={searchQuery}
          onChange={handleSearchChange}
          name="search-tokens"
        />
      </div>

      <div
        className={styles.hideLowBalance}
        onClick={() => setIsHideLowBalance(!isHideLowBalance)}
      >
        <span role="checkbox" className={styles.hideLowBalanceCheckbox}>
          <CheckCircleOutlinedIcon
            size={16}
            color={isHideLowBalance ? "#5BCCF1" : "var(--fg-quaternary)"}
          />
        </span>
        <Typography
          size="xs"
          weight="medium"
          color={isHideLowBalance ? "primary" : "placeholder"}
          tagType="label"
          className={styles.hideLowBalanceLabel}
        >
          Hide Low Balance
        </Typography>
      </div>

      <div className={styles.assetList}>
        {balances.map((asset) => {
          const address = chainStore.isEvmOnlyChain(asset.chainInfo.chainId)
            ? okoWalletAddressStore.getEthAddress()
            : okoWalletAddressStore.getBech32Address(asset.chainInfo.chainId);

          return (
            <Fragment
              key={`${asset.chainInfo.chainId}-${asset.token.currency.coinMinimalDenom}`}
            >
              <TokenItem viewToken={asset} address={address} />
            </Fragment>
          );
        })}
        {balances.length === 0 && <EmptyState />}
      </div>
    </>
  );
});

const EmptyState: FC = () => {
  const emptyImage = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/assets/oko_user_dashboard_assets_empty.webp`;
  const emptyImageAlt = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/assets/oko_user_dashboard_assets_empty.png`;

  return (
    <div className={styles.emptyState}>
      <ImageWithAlt
        srcSet={emptyImage}
        srcAlt={emptyImageAlt}
        alt="Empty Assets Image"
        className={styles.emptyImage}
      />

      <Typography tagType="p" size="sm" weight="semibold" color="tertiary">
        No Assets Found
      </Typography>

      <Typography tagType="p" size="sm" weight="medium" color="quaternary">
        If you have assets but they’re not appearing, please check if Hide Low{" "}
        Balance is turned on or if the chain is hidden in{" "}
        <ShowHideChainsModal
          renderTrigger={({ onOpen }) => (
            <span
              className={styles.showHideChainsLink}
              aria-role="button"
              onClick={onOpen}
            >
              Show/Hide Chains
            </span>
          )}
        />
      </Typography>
    </div>
  );
};
