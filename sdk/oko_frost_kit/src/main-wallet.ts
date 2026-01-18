import { OkoSolWallet, type OkoSolWalletInterface } from "@oko-wallet/oko-sdk-sol";
import { OkoFrostWalletClient } from "./client";
import { registerOkoRialoWallet } from "./rialo-wallet-standard";
import type { OkoFrostWalletInfo } from "./types";

/**
 * OkoFrostMainWallet manages the Oko wallet lifecycle for Frost/Rialo integration.
 * It wraps the OkoSolWallet since Rialo is Solana-compatible.
 */
export class OkoFrostMainWallet {
  private _walletInfo: OkoFrostWalletInfo;
  private _client: OkoFrostWalletClient | null = null;
  private _isInitialized = false;

  constructor(walletInfo: OkoFrostWalletInfo) {
    this._walletInfo = walletInfo;
  }

  get walletInfo(): OkoFrostWalletInfo {
    return this._walletInfo;
  }

  get client(): OkoFrostWalletClient | null {
    return this._client;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Initialize the underlying OkoSolWallet client
   */
  async initClient(): Promise<void> {
    const { options } = this._walletInfo;

    if (!options) {
      throw new Error("Oko wallet options unset");
    }

    if (!options.api_key) {
      throw new Error("Oko API key is required");
    }

    const solWalletResult = OkoSolWallet.init({
      api_key: options.api_key,
      sdk_endpoint: options.sdk_endpoint,
    });

    if (!solWalletResult.success) {
      throw new Error(
        `Failed to initialize OkoSolWallet: ${JSON.stringify(solWalletResult.err)}`,
      );
    }

    const solWallet = solWalletResult.data;

    // Wait for initialization
    await solWallet.waitUntilInitialized;

    // Register with wallet-standard for dApp discovery (Rialo features)
    registerOkoRialoWallet(solWallet);

    this._client = new OkoFrostWalletClient(solWallet);
    this._isInitialized = true;
  }

  /**
   * Get the underlying OkoSolWallet for direct access
   */
  getSolWallet(): OkoSolWalletInterface | null {
    return this._client?.client ?? null;
  }

  /**
   * Disconnect and reset the client state
   */
  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.disconnect();
      await this._client.client.okoWallet.signOut();
    }
  }
}
