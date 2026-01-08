import {
  type ChainRecord,
  ChainWalletBase,
  type SignType,
  State,
  type Wallet,
} from "@cosmos-kit/core";

import { OkoMainWallet } from "./main-wallet";
import { OkoWalletClient } from "./client";

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

  async initOfflineSigner(preferredSignType?: SignType): Promise<void> {
    const mainWallet = this.mainWallet as OkoMainWallet;
    const client = mainWallet.client as OkoWalletClient | undefined;

    if (!client) {
      throw new Error("Oko wallet client not initialized");
    }

    // Check if user is already signed in
    const publicKey = await client.client.okoWallet.getPublicKey();

    // If not signed in, trigger the sign-in flow before initializing offline signer
    if (!publicKey) {
      await client.client.okoWallet.openSignInModal();
    }

    // Continue with the standard offline signer initialization
    await super.initOfflineSigner(preferredSignType);
  }
}
