import { useState } from "react";
import { observer } from "mobx-react-lite";
import { SearchIcon } from "@oko-wallet-common-ui/icons/search";
import { CoinPretty } from "@keplr-wallet/unit";

import styles from "./token_list.module.scss";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { TokenItem } from "../token_item/token_item";
import { useSearch } from "@oko-wallet-user-dashboard/hooks/use_search";
import { ViewToken } from "@oko-wallet-user-dashboard/strores/huge-queries";

export const TokenList = observer(() => {
  const { hugeQueriesStore, chainStore, okoWalletAddressStore } =
    useRootStore();
  const assets = hugeQueriesStore.getAllBalances({ allowIBCToken: true });

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const searchedAssets = useSearch([...assets], searchQuery, searchFields);

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
      <ul className={styles.assetList}>
        {searchedAssets.map((asset) => {
          const address = chainStore.isEvmOnlyChain(asset.chainInfo.chainId)
            ? okoWalletAddressStore.getEthAddress()
            : okoWalletAddressStore.getBech32Address(asset.chainInfo.chainId);

          return <TokenItem viewToken={asset} address={address} />;
        })}
      </ul>
    </>
  );
});
