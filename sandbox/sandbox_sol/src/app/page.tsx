"use client";

import { useOkoSol } from "@/hooks/use_oko_sol";
import LoginView from "@/components/LoginView";
import ConnectedView from "@/components/ConnectedView";

export default function Home() {
  const {
    isInitialized,
    isInitializing,
    isConnected,
    publicKey,
    connect,
    disconnect,
  } = useOkoSol();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      {!isConnected ? (
        <LoginView
          isInitialized={isInitialized}
          isInitializing={isInitializing}
          onConnect={connect}
        />
      ) : (
        <ConnectedView publicKey={publicKey!} onDisconnect={disconnect} />
      )}
    </main>
  );
}
