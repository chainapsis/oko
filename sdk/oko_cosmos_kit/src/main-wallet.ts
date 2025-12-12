import {
  type ChainName,
  type DisconnectOptions,
  MainWalletBase,
  State,
} from "@cosmos-kit/core";
import { OkoCosmosWallet } from "@oko-wallet/oko-sdk-cosmos";

import { OkoChainWallet } from "./chain-wallet";
import { OkoWalletClient } from "./client";
import type { OkoWalletInfo } from "./types";

export class OkoMainWallet extends MainWalletBase {
  constructor(walletInfo: OkoWalletInfo) {
    super(walletInfo, OkoChainWallet);
  }

  get walletInfo(): OkoWalletInfo {
    return this._walletInfo as OkoWalletInfo;
  }

  async initClient() {
    const { options } = this.walletInfo;

    try {
      if (!options) {
        throw new Error("Oko wallet options unset");
      }

      if (!options.apiKey) {
        throw new Error("Oko API key is required");
      }
    } catch (error) {
      this.initClientError(error as Error);
      return;
    }

    this.initingClient();
    try {
      const cosmosWallet = OkoCosmosWallet.init({
        api_key: options.apiKey,
        sdk_endpoint: options.sdkEndpoint,
      });

      if (!cosmosWallet.success) {
        throw new Error("Failed to initialize OkoCosmosWallet");
      }

      this.initClientDone(
        new OkoWalletClient(cosmosWallet.data, options.loginProvider),
      );
    } catch (error) {
      this.initClientError(error as Error);
    }
  }

  async disconnectAll(
    activeOnly?: boolean,
    exclude?: ChainName,
    options?: DisconnectOptions,
  ): Promise<void> {
    if (this.client) {
      const okoClient = this.client as OkoWalletClient;
      await okoClient.client.okoWallet.signOut();
    }

    await super.disconnectAll(activeOnly, exclude, options);

    // Reset client state to Init to force re-initialization on next connect
    this.clientMutable.data = undefined;
    this.clientMutable.state = State.Init;
  }
}
