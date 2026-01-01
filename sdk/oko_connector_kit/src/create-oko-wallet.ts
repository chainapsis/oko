/**
 * Oko Wallet Standard Shim
 *
 * Creates a Wallet Standard-compatible wallet that wraps OkoSolWallet
 * for use with ConnectorKit and other Wallet Standard compatible apps.
 */

import type { Wallet, WalletAccount } from "@wallet-standard/base";
import type { OkoWalletConfig, OkoSolWalletLike, SolanaChain, WalletIcon } from "./types";
import {
  OKO_DEFAULT_ICON,
  SUPPORTED_CHAINS,
  deserializeTransaction,
  serializeTransaction,
  createWalletAccount,
  getConnectionForChain,
} from "./utils";

/**
 * Create a Wallet Standard-compatible wallet that wraps OkoSolWallet
 */
export function createOkoWallet(
  okoWallet: OkoSolWalletLike,
  config: OkoWalletConfig
): Wallet {
  const chains = SUPPORTED_CHAINS;
  const defaultChain = config.defaultChain || "solana:mainnet";

  let accounts: WalletAccount[] = [];
  const changeListeners = new Set<
    (props: { accounts?: readonly WalletAccount[] }) => void
  >();

  function emitChange() {
    changeListeners.forEach((fn) => fn({ accounts }));
  }

  /**
   * Update accounts from OkoSolWallet state
   */
  function updateAccounts(): void {
    if (okoWallet.connected && okoWallet.publicKey) {
      accounts = [createWalletAccount(okoWallet.publicKey, chains)];
    } else {
      accounts = [];
    }
    emitChange();
  }

  const wallet: Wallet = {
    version: "1.0.0",
    name: config.name || "Oko",
    icon: (config.icon || OKO_DEFAULT_ICON) as WalletIcon,
    chains: chains as readonly `${string}:${string}`[],

    get accounts() {
      return accounts;
    },

    features: {
      // Standard connect feature
      "standard:connect": {
        version: "1.0.0",
        connect: async (input?: { silent?: boolean }) => {
          // Wait for Oko initialization
          await okoWallet.waitUntilInitialized;

          // Check if already connected
          if (okoWallet.connected && okoWallet.publicKey) {
            updateAccounts();
            return { accounts };
          }

          // If silent mode and not connected, return empty accounts
          if (input?.silent && !okoWallet.connected) {
            return { accounts: [] };
          }

          // Trigger OAuth login flow (opens iframe modal)
          await okoWallet.connect();

          // Update accounts after connection
          updateAccounts();

          return { accounts };
        },
      },

      // Standard disconnect feature
      "standard:disconnect": {
        version: "1.0.0",
        disconnect: async () => {
          await okoWallet.disconnect();
          accounts = [];
          emitChange();
        },
      },

      // Standard events feature
      "standard:events": {
        version: "1.0.0",
        on: (
          event: string,
          listener: (props: { accounts?: readonly WalletAccount[] }) => void
        ) => {
          if (event !== "change") return () => {};
          changeListeners.add(listener);
          return () => changeListeners.delete(listener);
        },
      },

      // Solana sign transaction feature
      "solana:signTransaction": {
        version: "1.0.0",
        signTransaction: async ({
          transaction,
        }: {
          account: WalletAccount;
          transaction: Uint8Array;
          chain?: string;
        }) => {
          // Deserialize transaction
          const tx = deserializeTransaction(transaction);

          // Sign with OkoSolWallet (opens iframe modal for approval)
          const signedTx = await okoWallet.signTransaction(tx);

          // Serialize back to bytes
          const signedBytes = serializeTransaction(signedTx);

          return [{ signedTransaction: signedBytes }];
        },
      },

      // Solana sign and send transaction feature
      "solana:signAndSendTransaction": {
        version: "1.0.0",
        signAndSendTransaction: async ({
          transaction,
          chain,
          options,
        }: {
          account: WalletAccount;
          transaction: Uint8Array;
          chain?: string;
          options?: {
            skipPreflight?: boolean;
            maxRetries?: number;
          };
        }) => {
          // Deserialize transaction
          const tx = deserializeTransaction(transaction);

          // Get connection for the chain
          const chainId = (chain || defaultChain) as SolanaChain;
          const connection = getConnectionForChain(chainId, config.rpcEndpoint);

          // Send transaction via OkoSolWallet
          const signature = await okoWallet.sendTransaction(tx, connection, {
            skipPreflight: options?.skipPreflight,
            maxRetries: options?.maxRetries,
          });

          // Convert signature string to bytes
          const encoder = new TextEncoder();
          const signatureBytes = encoder.encode(signature);

          return [{ signature: signatureBytes }];
        },
      },

      // Solana sign all transactions feature
      "solana:signAllTransactions": {
        version: "1.0.0",
        signAllTransactions: async ({
          transactions,
        }: {
          account: WalletAccount;
          transactions: Uint8Array[];
          chain?: string;
        }) => {
          // Deserialize all transactions
          const txs = transactions.map(deserializeTransaction);

          // Sign all with OkoSolWallet
          const signedTxs = await okoWallet.signAllTransactions(txs);

          // Serialize back to bytes
          return signedTxs.map((signedTx) => ({
            signedTransaction: serializeTransaction(signedTx),
          }));
        },
      },

      // Solana sign message feature
      "solana:signMessage": {
        version: "1.0.0",
        signMessage: async ({
          message,
        }: {
          account: WalletAccount;
          message: Uint8Array;
        }) => {
          // Sign message with OkoSolWallet
          const signature = await okoWallet.signMessage(message);

          return [{ signature, signedMessage: message }];
        },
      },
    },
  };

  return wallet;
}
