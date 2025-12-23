"use client";

import { useState } from "react";
import { useSdkStore } from "@/store/sdk";
import bs58 from "bs58";
import styles from "./widget.module.css";

export function SignMessageWidget() {
  const { okoSolWallet } = useSdkStore();
  const [message, setMessage] = useState("Hello, Solana!");
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignMessage = async () => {
    if (!okoSolWallet) return;

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await okoSolWallet.signMessage(messageBytes);

      const signatureBase58 = bs58.encode(signatureBytes);
      setSignature(signatureBase58);
      console.log("[sandbox_sol] Message signed:", signatureBase58);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("[sandbox_sol] Failed to sign message:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Sign Message</h3>
      <p className={styles.description}>
        Sign an arbitrary message with your Solana wallet
      </p>

      <div className={styles.field}>
        <label className={styles.label}>Message</label>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message to sign..."
          rows={3}
        />
      </div>

      <button
        className={styles.button}
        onClick={handleSignMessage}
        disabled={isLoading || !message}
      >
        {isLoading ? "Signing..." : "Sign Message"}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {signature && (
        <div className={styles.result}>
          <label className={styles.label}>Signature (base58)</label>
          <code className={styles.code}>{signature}</code>
        </div>
      )}
    </div>
  );
}
