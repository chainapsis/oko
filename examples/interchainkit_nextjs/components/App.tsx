"use client";

import { useChain } from "@interchain-kit/react";
import { WalletState } from "@interchain-kit/core";

import LoginView from "./LoginView";
import ConnectedView from "./ConnectedView";

export default function App() {
  const { status } = useChain("osmosistestnet");

  const isSignedIn = status === WalletState.Connected;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {!isSignedIn ? <LoginView /> : <ConnectedView />}
    </div>
  );
}
