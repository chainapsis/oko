"use client";

import { useChain } from "@cosmos-kit/react";
import { WalletStatus } from "@cosmos-kit/core";

import LoginView from "./LoginView";
import ConnectedView from "./ConnectedView";

export default function App() {
  const { status } = useChain("osmosis");

  const isSignedIn = status === WalletStatus.Connected;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {!isSignedIn ? <LoginView /> : <ConnectedView />}
    </div>
  );
}
