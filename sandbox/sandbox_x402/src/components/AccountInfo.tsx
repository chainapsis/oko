"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createPublicClient, http, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";
import Button from "./Button";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

interface AccountInfoProps {
  address: string;
  onDisconnect: () => void;
  className?: string;
}

export default function AccountInfo({
  address,
  onDisconnect,
  className,
}: AccountInfoProps) {
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setEthBalance(null);
      setUsdcBalance(null);
      return;
    }

    setIsLoadingBalance(true);
    try {
      // Fetch ETH balance
      const ethBal = await publicClient.getBalance({
        address: address as `0x${string}`,
      });
      setEthBalance(formatUnits(ethBal, 18));

      // Fetch USDC balance
      const usdcBal = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: [
          {
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      setUsdcBalance(formatUnits(usdcBal as bigint, 6));
    } catch (err) {
      console.error("[sandbox_x402] Failed to fetch balance:", err);
      setEthBalance(null);
      setUsdcBalance(null);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  function formatAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  const ethDisplay = isLoadingBalance
    ? "..."
    : ethBalance !== null
      ? `${parseFloat(ethBalance).toFixed(6)} ETH`
      : "-";

  const usdcDisplay = isLoadingBalance
    ? "..."
    : usdcBalance !== null
      ? `${parseFloat(usdcBalance).toFixed(6)} USDC`
      : "-";

  return (
    <div
      className={`bg-widget border border-widget-border rounded-3xl p-10 shadow-xl h-full flex flex-col ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-semibold tracking-tight">Account</h3>
        <Button onClick={onDisconnect} variant="ghost" size="sm">
          Sign out
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <CopyableAddress value={address} format={formatAddress} />
        <AvailableBalance
          ethValue={ethDisplay}
          usdcValue={usdcDisplay}
          onRefresh={fetchBalance}
          isLoading={isLoadingBalance}
        />
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold tracking-wide uppercase text-gray-300 mb-2">
      {children}
    </label>
  );
}

function CopyableAddress({
  value,
  format,
}: {
  value?: string;
  format?: (value: string) => string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <FieldLabel>Wallet Address</FieldLabel>
      <button
        type="button"
        onClick={async () => {
          if (!value) return;
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="group flex items-center justify-between bg-widget-field border border-widget-border rounded-2xl px-6 py-5 font-mono text-sm hover:border-widget-border-hover transition-colors text-left"
      >
        <span className="truncate mr-4">
          {format && value ? format(value) : "No address"}
        </span>
        <span className="relative flex items-center">
          <svg
            className={`h-5 w-5 transition-opacity ${
              copied ? "opacity-0" : "opacity-80 group-hover:opacity-100"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 9.5C9 8.67157 9.67157 8 10.5 8H17.5C18.3284 8 19 8.67157 19 9.5V16.5C19 17.3284 18.3284 18 17.5 18H10.5C9.67157 18 9 17.3284 9 16.5V9.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 15.5H6.5C5.67157 15.5 5 14.8284 5 14V7C5 6.17157 5.67157 5.5 6.5 5.5H13.5C14.3284 5.5 15 6.17157 15 7V7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            className={`absolute right-0 h-5 w-5 text-green-400 transition-opacity ${
              copied ? "opacity-100" : "opacity-0"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}

function AvailableBalance({
  ethValue,
  usdcValue,
  onRefresh,
  isLoading,
}: {
  ethValue?: string;
  usdcValue?: string;
  onRefresh: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex items-center justify-between">
        <FieldLabel>Available Balance</FieldLabel>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh balance"
        >
          <svg
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3313 3 18.2398 4.80826 19.8299 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M21 3V7.5H16.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="bg-widget-field border border-widget-border rounded-2xl px-6 py-6 hover:border-widget-border-hover transition-colors">
        <div className="flex flex-col gap-2">
          <div className="text-3xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
            {usdcValue ?? "..."}
          </div>
          <div className="text-lg text-gray-400">
            {ethValue ?? "..."}
          </div>
        </div>
        <Link
          href="https://faucet.circle.com/"
          target="_blank"
          className="inline-flex items-center gap-2 mt-3 text-sm text-gray-300 hover:text-white underline underline-offset-4"
        >
          Get USDC on Base Sepolia
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 17L17 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M9 7H17V15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
