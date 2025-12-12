import { CosmosWallet } from "@interchain-kit/core";
import type {
  BroadcastMode,
  SignOptions,
  StdSignature,
  Wallet,
  WalletAccount,
} from "@interchain-kit/core";
import type { OkoCosmosWalletInterface } from "@oko-wallet/oko-sdk-cosmos";

import type { OkoLoginProvider } from "./types";

/**
 * Oko Cosmos Wallet implementation for interchain-kit
 */
export class OkoWallet extends CosmosWallet {
  private okoClient: OkoCosmosWalletInterface;
  private loginProvider: OkoLoginProvider;
  defaultSignOptions: {
    preferNoSetFee: boolean;
    preferNoSetMemo: boolean;
    disableBalanceCheck: boolean;
  } = {
    preferNoSetFee: false,
    preferNoSetMemo: false,
    disableBalanceCheck: false,
  };

  constructor(
    walletInfo: Wallet,
    okoClient: OkoCosmosWalletInterface,
    loginProvider: OkoLoginProvider,
  ) {
    super(walletInfo);
    this.okoClient = okoClient;
    this.loginProvider = loginProvider;

    // Expose client for interchain-kit
    (this as any).client = okoClient;
  }

  setSignOptions(options: SignOptions): void {
    this.defaultSignOptions = {
      ...this.defaultSignOptions,
      ...options,
    };
  }

  async init(): Promise<void> {
    await this.okoClient.waitUntilInitialized;
  }

  async connect(_chainId: string): Promise<void> {}

  async disconnect(_chainId: string): Promise<void> {
    await this.okoClient.okoWallet.signOut();
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    // Check if user is already signed in
    const publicKey = await this.okoClient.okoWallet.getPublicKey();

    // If not signed in, trigger the sign-in flow
    if (!publicKey) {
      await this.okoClient.okoWallet.signIn(this.loginProvider);
    }

    const key = await this.okoClient.getKey(chainId);

    // Ensure pubkey is a Uint8Array (handles deserialized Buffer format)
    let pubkey = key.pubKey;
    if (
      pubkey &&
      typeof pubkey === "object" &&
      "type" in pubkey &&
      pubkey.type === "Buffer" &&
      "data" in pubkey
    ) {
      // Convert from {type: "Buffer", data: [...]} to Uint8Array
      pubkey = new Uint8Array((pubkey as any).data);
    }

    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo as any,
      pubkey,
      isNanoLedger: key.isNanoLedger,
    };
  }

  async getOfflineSigner(chainId: string): Promise<any> {
    return this.okoClient.getOfflineSigner(chainId);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: any,
    _signOptions?: any,
  ): Promise<any> {
    return this.okoClient.signAmino(chainId, signer, signDoc);
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
  ): Promise<StdSignature> {
    return await this.okoClient.signArbitrary(chainId, signer, data);
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: any,
    _signOptions?: any,
  ): Promise<any> {
    return this.okoClient.signDirect(chainId, signer, signDoc);
  }

  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode) {
    return await this.okoClient.sendTx(chainId, tx, mode);
  }

  async addSuggestChain(_chainId: string): Promise<void> {}
}
