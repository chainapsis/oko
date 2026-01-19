import {
  type ChainRecord,
  ChainWalletBase,
  State,
  type Wallet,
} from "@cosmos-kit/core";

import type { OkoMainWallet } from "./main-wallet";

export class OkoChainWallet extends ChainWalletBase {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo);
  }

  async update() {
    // If MainWallet's client is undefined and state is Init, force re-initialization
    const mainWallet = this.mainWallet as OkoMainWallet;
    if (
      mainWallet &&
      !mainWallet.client &&
      mainWallet.clientMutable?.state === State.Init
    ) {
      await mainWallet.initClient();
    }

    await super.update();
  }
}
