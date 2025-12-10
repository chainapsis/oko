import { type ChangeEvent, Fragment, useState } from "react";
import { observer } from "mobx-react-lite";
import { CoinPretty } from "@keplr-wallet/unit";
import { SearchIcon } from "@oko-wallet/oko-common-ui/icons/search";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { CheckCircleOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/check_circle_outlined";

import styles from "./token_list.module.scss";
import { TokenItem } from "../token_item/token_item";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { useSearch } from "@oko-wallet-user-dashboard/hooks/use_search";
import { ViewToken } from "@oko-wallet-user-dashboard/strores/huge-queries";

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

  const searchedTokens = useSearch([...tokens], searchQuery, searchFields);

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
      </div>
    </>
  );
});
