import type { OkoSolWalletInterface } from "@oko-wallet/oko-sdk-sol";

/**
 * OkoFrostWalletClient wraps OkoSolWallet for Frost/Rialo integration.
 * Since Rialo is Solana-compatible, we use the Solana SDK under the hood.
 */
export class OkoFrostWalletClient {
  readonly client: OkoSolWalletInterface;

  constructor(client: OkoSolWalletInterface) {
    this.client = client;
  }

  /**
   * Get the connected account address
   */
  get address(): string | null {
    return this.client.publicKey?.toBase58() ?? null;
  }

  /**
   * Check if wallet is connected
   */
  get isConnected(): boolean {
    return this.client.connected;
  }

  /**
   * Connect the wallet
   */
  async connect(): Promise<void> {
    // Check if user is signed in (has ECDSA key from OAuth)
    const existingKey = await this.client.okoWallet.getPublicKey();
    if (!existingKey) {
      // Not signed in - open provider select modal
      await this.client.okoWallet.openSignInModal();
    } else {
      // User is signed in - ensure Ed25519 key exists (generate if needed)
      const ed25519Key = await this.client.okoWallet.ensureEd25519Key();
      if (!ed25519Key) {
        throw new Error("Failed to generate Ed25519 key");
      }
    }
    // connect() retrieves the Ed25519 key
    await this.client.connect();
  }

  /**
   * Disconnect the wallet
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Sign an arbitrary message
   */
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return await this.client.signMessage(message);
  }

  /**
   * Sign a transaction (Solana-compatible)
   */
  async signTransaction<T>(transaction: T): Promise<T> {
    return await this.client.signTransaction(transaction as Parameters<typeof this.client.signTransaction>[0]) as T;
  }

  /**
   * Sign multiple transactions (Solana-compatible)
   */
  async signAllTransactions<T>(transactions: T[]): Promise<T[]> {
    return await this.client.signAllTransactions(transactions as Parameters<typeof this.client.signAllTransactions>[0]) as T[];
  }
}
