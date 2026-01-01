import {
  Transaction,
  VersionedTransaction,
  PublicKey,
  Connection,
} from "@solana/web3.js";
import type { WalletAccount } from "@wallet-standard/base";
import type { SolanaChain, WalletIcon } from "./types";

/**
 * Default Oko wallet icon (SVG data URI)
 */
export const OKO_DEFAULT_ICON: WalletIcon =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzFBMUExQSIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=";

/**
 * Supported Solana chains
 */
export const SUPPORTED_CHAINS: readonly SolanaChain[] = [
  "solana:mainnet",
  "solana:devnet",
  "solana:testnet",
  "solana:localnet",
] as const;

/**
 * RPC endpoints for each chain
 */
export const CHAIN_RPC_ENDPOINTS: Record<SolanaChain, string> = {
  "solana:mainnet": "https://api.mainnet-beta.solana.com",
  "solana:devnet": "https://api.devnet.solana.com",
  "solana:testnet": "https://api.testnet.solana.com",
  "solana:localnet": "http://localhost:8899",
};

/**
 * Deserialize a transaction from bytes
 * Tries VersionedTransaction first, falls back to legacy Transaction
 */
export function deserializeTransaction(
  bytes: Uint8Array
): Transaction | VersionedTransaction {
  try {
    // Try versioned transaction first
    return VersionedTransaction.deserialize(bytes);
  } catch {
    // Fall back to legacy transaction
    return Transaction.from(bytes);
  }
}

/**
 * Serialize a transaction to bytes
 */
export function serializeTransaction(
  transaction: Transaction | VersionedTransaction
): Uint8Array {
  return new Uint8Array(transaction.serialize());
}

/**
 * Create a WalletAccount from a PublicKey
 */
export function createWalletAccount(
  publicKey: PublicKey,
  chains: readonly SolanaChain[]
): WalletAccount {
  return {
    address: publicKey.toBase58(),
    publicKey: publicKey.toBytes(),
    chains: [...chains] as `${string}:${string}`[],
    features: [
      "solana:signTransaction",
      "solana:signAndSendTransaction",
      "solana:signAllTransactions",
      "solana:signMessage",
    ],
  };
}

/**
 * Get a Connection for the given chain
 */
export function getConnectionForChain(
  chain: SolanaChain,
  customRpcEndpoint?: string
): Connection {
  const endpoint = customRpcEndpoint || CHAIN_RPC_ENDPOINTS[chain];
  return new Connection(endpoint, "confirmed");
}

/**
 * Convert base58 signature to bytes
 */
export function base58ToBytes(base58: string): Uint8Array {
  // Use bs58 encoding from solana/web3.js
  const { bs58 } = require("@solana/web3.js").default || require("@solana/web3.js");
  if (bs58?.decode) {
    return bs58.decode(base58);
  }
  // Fallback: manual base58 decoding
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes: number[] = [];
  for (let i = 0; i < base58.length; i++) {
    const char = base58[i];
    const p = ALPHABET.indexOf(char);
    if (p === -1) {
      throw new Error(`Invalid base58 character: ${char}`);
    }
    for (let j = 0; j < bytes.length; j++) {
      const n = bytes[j] * 58 + p;
      bytes[j] = n % 256;
      p === Math.floor(n / 256);
    }
    if (p > 0 || bytes.length === 0) {
      bytes.push(p);
    }
  }
  // Handle leading zeros
  for (let i = 0; i < base58.length && base58[i] === "1"; i++) {
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}

/**
 * Convert bytes to base58
 */
export function bytesToBase58(bytes: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const result: number[] = [];

  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < result.length; j++) {
      carry += result[j] * 256;
      result[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      result.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  // Handle leading zeros
  for (const byte of bytes) {
    if (byte === 0) {
      result.push(0);
    } else {
      break;
    }
  }

  return result.reverse().map(i => ALPHABET[i]).join("");
}
