"use client";

import { useOkoEth } from "@/hooks/use_oko_eth";
import LoginView from "@/components/LoginView";
import ConnectedView from "@/components/ConnectedView";

export default function Home() {
  const {
    isInitialized,
    isInitializing,
    isConnected,
    address,
    connect,
    disconnect,
  } = useOkoEth();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      {!isConnected ? (
        <LoginView
          isInitialized={isInitialized}
          isInitializing={isInitializing}
          onConnect={connect}
        />
      ) : (
        <ConnectedView address={address!} onDisconnect={disconnect} />
      )}
    </main>
  );
}
