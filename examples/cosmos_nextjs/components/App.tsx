"use client";

import LoginView from "./LoginView";
import ConnectedView from "./ConnectedView";
import useOkoCosmos from "@/hooks/useOkoCosmos";

export default function App() {
  const { isSignedIn } = useOkoCosmos();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {!isSignedIn ? <LoginView /> : <ConnectedView />}
    </div>
  );
}
