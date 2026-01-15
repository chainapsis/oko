"use client";

import { useState } from "react";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

import { useSdkStore } from "@/store/sdk";
import Button from "./Button";
import { DEVNET_CONNECTION } from "@/lib/connection";

type TestTxType =
  | "sol_transfer"
  | "multi_sol_transfer"
  | "create_account"
  | "versioned_tx";

interface TestTxOption {
  id: TestTxType;
  name: string;
  description: string;
}

const TEST_TX_OPTIONS: TestTxOption[] = [
  {
    id: "sol_transfer",
    name: "SOL Transfer",
    description: "Simple SOL transfer using System Program",
  },
  {
    id: "multi_sol_transfer",
    name: "Multi SOL Transfer",
    description: "3 SOL transfers in one transaction",
  },
  {
    id: "create_account",
    name: "Create Account",
    description: "System Program createAccount instruction",
  },
  {
    id: "versioned_tx",
    name: "Versioned Transaction",
    description: "SOL transfer using VersionedTransaction (V0)",
  },
];

export function TestTransactionsWidget() {
  const { okoSolWallet, publicKey } = useSdkStore();
  const [selectedTx, setSelectedTx] = useState<TestTxType>("sol_transfer");
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTestTransaction = async (): Promise<
    Transaction | VersionedTransaction
  > => {
    if (!publicKey) {
      throw new Error("No public key");
    }

    const fromPubkey = new PublicKey(publicKey);
    const { blockhash } = await DEVNET_CONNECTION.getLatestBlockhash();

    const testRecipient = new PublicKey("11111111111111111111111111111112");

    switch (selectedTx) {
      case "sol_transfer": {
        return new Transaction({
          recentBlockhash: blockhash,
          feePayer: fromPubkey,
        }).add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: testRecipient,
            lamports: 0.001 * LAMPORTS_PER_SOL,
          }),
        );
      }

      case "multi_sol_transfer": {
        const tx = new Transaction({
          recentBlockhash: blockhash,
          feePayer: fromPubkey,
        });

        for (let i = 0; i < 3; i++) {
          tx.add(
            SystemProgram.transfer({
              fromPubkey,
              toPubkey: new PublicKey(
                `1111111111111111111111111111111${i + 2}`,
              ),
              lamports: (0.0001 + i * 0.0001) * LAMPORTS_PER_SOL,
            }),
          );
        }

        return tx;
      }

      case "create_account": {
        const newAccount = PublicKey.unique();

        return new Transaction({
          recentBlockhash: blockhash,
          feePayer: fromPubkey,
        }).add(
          SystemProgram.createAccount({
            fromPubkey,
            newAccountPubkey: newAccount,
            lamports: 0.001 * LAMPORTS_PER_SOL,
            space: 0,
            programId: SystemProgram.programId,
          }),
        );
      }

      case "versioned_tx": {
        const message = new TransactionMessage({
          payerKey: fromPubkey,
          recentBlockhash: blockhash,
          instructions: [
            SystemProgram.transfer({
              fromPubkey,
              toPubkey: testRecipient,
              lamports: 0.001 * LAMPORTS_PER_SOL,
            }),
          ],
        }).compileToV0Message();

        return new VersionedTransaction(message);
      }

      default:
        throw new Error("Unknown transaction type");
    }
  };

  const handleSignTransaction = async () => {
    if (!okoSolWallet || !publicKey) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      const tx = await createTestTransaction();

      const signedTx = await okoSolWallet.signTransaction(tx);

      if (signedTx instanceof VersionedTransaction) {
        const sig = signedTx.signatures[0];
        setSignature(sig ? bs58.encode(sig) : "Signed (no signature)");
      } else {
        const sig = signedTx.signature;
        setSignature(sig ? bs58.encode(sig) : "Signed (no signature)");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-widget border border-widget-border rounded-3xl p-10 shadow-xl">
      <h3 className="text-2xl font-semibold tracking-tight mb-2">
        Test Transactions
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Test various transaction types to verify parser
      </p>

      <div className="flex flex-col gap-4 mb-6">
        {TEST_TX_OPTIONS.map((option) => (
          <label
            key={option.id}
            className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
              selectedTx === option.id
                ? "border-purple-500 bg-purple-500/10"
                : "border-widget-border hover:border-widget-border-hover"
            }`}
          >
            <input
              type="radio"
              name="txType"
              value={option.id}
              checked={selectedTx === option.id}
              onChange={() => setSelectedTx(option.id)}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-white">{option.name}</div>
              <div className="text-sm text-gray-400">{option.description}</div>
            </div>
          </label>
        ))}
      </div>

      <Button
        onClick={handleSignTransaction}
        disabled={isLoading}
        loading={isLoading}
        size="lg"
        className="w-full"
      >
        Sign Test Transaction
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {signature && (
        <div className="mt-6 flex flex-col gap-3">
          <label className="block text-xs font-semibold tracking-wide uppercase text-gray-300">
            Signature
          </label>
          <code className="block bg-widget-field border border-widget-border rounded-2xl px-6 py-5 font-mono text-xs break-all text-green-400">
            {signature}
          </code>
        </div>
      )}
    </div>
  );
}
