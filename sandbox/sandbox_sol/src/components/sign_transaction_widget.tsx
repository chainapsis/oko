"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";

import { useSdkStore } from "@/store/sdk";
import styles from "./widget.module.css";

const DEVNET_CONNECTION = new Connection(
  "https://api.devnet.solana.com",
  "confirmed",
);

export function SignTransactionWidget() {
  const { okoSolWallet, publicKey } = useSdkStore();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    setIsLoadingBalance(true);
    try {
      const pubkey = new PublicKey(publicKey);
      const lamports = await DEVNET_CONNECTION.getBalance(pubkey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error("[sandbox_sol] Failed to fetch balance:", err);
      setBalance(null);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleSignTransaction = async () => {
    if (!okoSolWallet || !publicKey) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(recipient);
      } catch {
        throw new Error("Invalid recipient address");
      }

      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
      if (lamports <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const fromPubkey = new PublicKey(publicKey);
      const { blockhash } = await DEVNET_CONNECTION.getLatestBlockhash();

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromPubkey,
      }).add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: recipientPubkey,
          lamports,
        }),
      );

      const signedTx = await okoSolWallet.signTransaction(transaction);
      const txSignature = signedTx.signature;

      if (txSignature) {
        const signatureBase58 = bs58.encode(txSignature);
        setSignature(signatureBase58);
        console.log("[sandbox_sol] Transaction signed:", signatureBase58);
      } else {
        setSignature("Transaction signed (no signature extracted)");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("[sandbox_sol] Failed to sign transaction:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!okoSolWallet || !publicKey) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(recipient);
      } catch {
        throw new Error("Invalid recipient address");
      }

      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
      if (lamports <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const fromPubkey = new PublicKey(publicKey);
      const { blockhash } = await DEVNET_CONNECTION.getLatestBlockhash();

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromPubkey,
      }).add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: recipientPubkey,
          lamports,
        }),
      );

      const txSignature = await okoSolWallet.sendTransaction(
        transaction,
        DEVNET_CONNECTION,
      );

      setSignature(txSignature);
      console.log("[sandbox_sol] Transaction sent:", txSignature);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("[sandbox_sol] Failed to send transaction:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const balanceLabel = isLoadingBalance
    ? "Loading..."
    : balance !== null
      ? `${balance.toFixed(4)} SOL`
      : "—";

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Sign Transaction</h3>
      <p className={styles.description}>
        Create and sign a SOL transfer transaction (Devnet)
      </p>

      {publicKey && (
        <div className={styles.balanceRow}>
          <span className={styles.balanceLabel}>Balance:</span>
          <span className={styles.balanceValue}>{balanceLabel}</span>
          <button
            className={styles.refreshButton}
            onClick={fetchBalance}
            disabled={isLoadingBalance}
            title="Refresh balance"
          >
            ↻
          </button>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Recipient Address</label>
        <input
          type="text"
          className={styles.input}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter Solana address..."
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Amount (SOL)</label>
        <input
          type="number"
          className={styles.input}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.001"
          step="0.001"
          min="0"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={handleSignTransaction}
          disabled={isLoading || !recipient}
        >
          {isLoading ? "Signing..." : "Sign Only"}
        </button>
        <button
          className={`${styles.button} ${styles.primary}`}
          onClick={handleSendTransaction}
          disabled={isLoading || !recipient}
        >
          {isLoading ? "Sending..." : "Sign & Send"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {signature && (
        <div className={styles.result}>
          <label className={styles.label}>Transaction Signature</label>
          <code className={styles.code}>{signature}</code>
          {signature.length > 50 && (
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              View on Solana Explorer
            </a>
          )}
        </div>
      )}
    </div>
  );
}
