"use client";

import { useState } from "react";
import { useWalletStore } from "@/store/wallet";
import type { SolanaSignMessageFeature } from "@/types/wallet-features";
import bs58 from "bs58";
import Button from "./Button";

export function SignMessageWidget() {
  const { wallet } = useWalletStore();
  const [message, setMessage] = useState("Hello, Solana!");
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignMessage = async () => {
    if (!wallet) return;

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      const messageBytes = new TextEncoder().encode(message);

      // Get the signMessage feature from wallet
      const signMessageFeature = (
        wallet.features as unknown as SolanaSignMessageFeature
      )["solana:signMessage"];
      if (!signMessageFeature) {
        throw new Error("Wallet does not support signMessage");
      }

      const account = wallet.accounts[0];
      if (!account) {
        throw new Error("No account connected");
      }

      const result = await signMessageFeature.signMessage({
        account,
        message: messageBytes,
      });

      const signatureBytes = result[0].signature;
      const signatureBase58 = bs58.encode(signatureBytes);
      setSignature(signatureBase58);
      console.log("[sandbox_connector_kit] Message signed:", signatureBase58);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error(
        "[sandbox_connector_kit] Failed to sign message:",
        errorMessage,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-widget border border-widget-border rounded-3xl p-10 shadow-xl">
      <h3 className="text-2xl font-semibold tracking-tight mb-2">
        Sign Message
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Sign an arbitrary message with your Solana wallet via ConnectorKit
      </p>

      <div className="flex flex-col gap-3 mb-6">
        <label className="block text-xs font-semibold tracking-wide uppercase text-gray-300">
          Message
        </label>
        <textarea
          className="w-full bg-widget-field border border-widget-border rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-widget-border-hover focus:ring-2 focus:ring-widget-border-hover transition-all resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message to sign..."
          rows={3}
        />
      </div>

      <Button
        onClick={handleSignMessage}
        disabled={isLoading || !message}
        loading={isLoading}
        fullWidth
        size="lg"
      >
        Sign Message
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {signature && (
        <div className="mt-6 flex flex-col gap-3">
          <label className="block text-xs font-semibold tracking-wide uppercase text-gray-300">
            Signature (base58)
          </label>
          <code className="block bg-widget-field border border-widget-border rounded-2xl px-6 py-5 font-mono text-xs break-all text-green-400">
            {signature}
          </code>
        </div>
      )}
    </div>
  );
}
