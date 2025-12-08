import { observer } from "mobx-react-lite";

import styles from "./token_list.module.scss";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { TokenItem } from "../token_item/token_item";

export const TokenList = observer(() => {
  const { hugeQueriesStore, chainStore, okoWalletAddressStore } =
    useRootStore();
  const assets = hugeQueriesStore.getAllBalances({ allowIBCToken: true });

  return (
    <ul className={styles.assetList}>
      {assets.map((asset) => {
        const address = chainStore.isEvmOnlyChain(asset.chainInfo.chainId)
          ? okoWalletAddressStore.getEthAddress()
          : okoWalletAddressStore.getBech32Address(asset.chainInfo.chainId);

        return <TokenItem viewToken={asset} copyAddress={address} />;
      })}
    </ul>
  );
});
