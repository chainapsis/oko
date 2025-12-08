"use client";

import { useAccount } from "wagmi";

import LoginView from "./LoginView";
import ConnectedView from "./ConnectedView";

export default function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {!isConnected ? <LoginView /> : <ConnectedView />}
    </div>
  );
}
