import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionMethod,
  SolanaSignAndSendTransactionOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageMethod,
  SolanaSignMessageOutput,
  SolanaSignTransactionFeature,
  SolanaSignTransactionMethod,
  SolanaSignTransactionOutput,
} from "@solana/wallet-standard-features";
import {
  Connection,
  clusterApiUrl,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

import { isSolanaChain, SOLANA_MAINNET_CHAIN } from "./chains";
import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

// Support both legacy and versioned transactions
const SUPPORTED_TRANSACTION_VERSIONS = ["legacy", 0] as const;

function getConnection(chain?: string): Connection {
  if (!chain || chain === SOLANA_MAINNET_CHAIN) {
    return new Connection(clusterApiUrl("mainnet-beta"));
  }
  if (chain === "solana:devnet") {
    return new Connection(clusterApiUrl("devnet"));
  }
  if (chain === "solana:testnet") {
    return new Connection(clusterApiUrl("testnet"));
  }
  return new Connection(clusterApiUrl("mainnet-beta"));
}

function deserializeTransaction(
  bytes: Uint8Array,
): Transaction | VersionedTransaction {
  try {
    return VersionedTransaction.deserialize(bytes);
  } catch {
    return Transaction.from(bytes);
  }
}

export function createSignMessageFeature(
  wallet: OkoSolWalletInterface,
): SolanaSignMessageFeature {
  const signMessage: SolanaSignMessageMethod = async (
    ...inputs
  ): Promise<SolanaSignMessageOutput[]> => {
    const outputs: SolanaSignMessageOutput[] = [];

    for (const input of inputs) {
      const signature = await wallet.signMessage(input.message);
      outputs.push({
        signedMessage: input.message,
        signature,
      });
    }

    return outputs;
  };

  return {
    "solana:signMessage": {
      version: "1.0.0",
      signMessage,
    },
  };
}

export function createSignTransactionFeature(
  wallet: OkoSolWalletInterface,
): SolanaSignTransactionFeature {
  const signTransaction: SolanaSignTransactionMethod = async (
    ...inputs
  ): Promise<SolanaSignTransactionOutput[]> => {
    const outputs: SolanaSignTransactionOutput[] = [];

    for (const input of inputs) {
      if (input.chain && !isSolanaChain(input.chain)) {
        throw new Error(`Unsupported chain: ${input.chain}`);
      }

      const transaction = deserializeTransaction(input.transaction);
      const signedTransaction = await wallet.signTransaction(transaction);
      const signedBytes = signedTransaction.serialize();

      outputs.push({
        signedTransaction: signedBytes,
      });
    }

    return outputs;
  };

  return {
    "solana:signTransaction": {
      version: "1.0.0",
      supportedTransactionVersions: SUPPORTED_TRANSACTION_VERSIONS,
      signTransaction,
    },
  };
}

export function createSignAndSendTransactionFeature(
  wallet: OkoSolWalletInterface,
): SolanaSignAndSendTransactionFeature {
  const signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (
    ...inputs
  ): Promise<SolanaSignAndSendTransactionOutput[]> => {
    const outputs: SolanaSignAndSendTransactionOutput[] = [];

    for (const input of inputs) {
      if (input.chain && !isSolanaChain(input.chain)) {
        throw new Error(`Unsupported chain: ${input.chain}`);
      }

      const transaction = deserializeTransaction(input.transaction);
      const connection = getConnection(input.chain);

      const { signature } = await wallet.signAndSendTransaction(
        transaction,
        connection,
        input.options,
      );

      // signature is base58 encoded, decode to Uint8Array
      const signatureBytes = bs58.decode(signature);

      outputs.push({
        signature: signatureBytes,
      });
    }

    return outputs;
  };

  return {
    "solana:signAndSendTransaction": {
      version: "1.0.0",
      supportedTransactionVersions: SUPPORTED_TRANSACTION_VERSIONS,
      signAndSendTransaction,
    },
  };
}
