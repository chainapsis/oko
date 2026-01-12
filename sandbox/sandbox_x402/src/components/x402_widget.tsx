"use client";

import { useState, useMemo } from "react";
import { useSdkStore } from "@/store/sdk";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import Button from "./Button";

const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || "http://localhost:4402";

export function X402Widget() {
  const { okoEthWallet } = useSdkStore();
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestPayment = async () => {
    if (!okoEthWallet) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Get the viem account from OkoEthWallet
      const signer = await okoEthWallet.toViemAccount();
      console.log("[sandbox_x402] Signer address:", signer.address);

      // Create x402 client and register EVM scheme
      const client = new x402Client();
      registerExactEvmScheme(client, { signer });

      // Wrap fetch with x402 payment capability
      const fetchWithPayment = wrapFetchWithPayment(fetch, client);

      // Make a request to the x402-protected endpoint with payment
      const res = await fetchWithPayment(`${X402_SERVER_URL}/protected`);
      const data = await res.text();

      setResponse(data);
      console.log("[sandbox_x402] Payment successful:", data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("[sandbox_x402] Payment failed:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-widget border border-widget-border rounded-3xl p-10 shadow-xl">
      <h3 className="text-2xl font-semibold tracking-tight mb-2">
        x402 Payment Test
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Test HTTP 402 payment flow with USDC on Base Sepolia
      </p>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="block text-xs font-semibold tracking-wide uppercase text-gray-300">
            Protected Endpoint
          </label>
          <div className="bg-widget-field border border-widget-border rounded-2xl px-6 py-4 font-mono text-sm text-gray-400">
            {X402_SERVER_URL}/protected
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-xs font-semibold tracking-wide uppercase text-gray-300">
            Price
          </label>
          <div className="bg-widget-field border border-widget-border rounded-2xl px-6 py-4">
            <span className="text-x402-green font-semibold">$0.001 USDC</span>
            <span className="text-gray-500 ml-2">per request</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleTestPayment}
        disabled={isLoading || !okoEthWallet}
        loading={isLoading}
        fullWidth
        size="lg"
        className="bg-x402-purple hover:bg-x402-purple/90"
      >
        Make Payment Request
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-6 flex flex-col gap-3">
          <label className="block text-xs font-semibold tracking-wide uppercase text-gray-300">
            Response
          </label>
          <div className="bg-widget-field border border-widget-border rounded-2xl px-6 py-5 font-mono text-sm break-all text-x402-green">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
