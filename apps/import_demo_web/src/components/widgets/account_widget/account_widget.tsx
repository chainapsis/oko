import React, { useState } from "react";

import { useSDKState } from "@oko-wallet-import-demo-web/state/sdk";
import { useUserInfoState } from "@oko-wallet-import-demo-web/state/user_info";
import { AuthProgressWidget } from "./auth_progress_widget";
import { AccountInfoWidget } from "./account_info_widget";
import { LoginWidget } from "../login_widget/login_widget";

type SigningInState =
  | { status: "ready" }
  | { status: "signing-in" }
  | { status: "failed"; error: string };

export const AccountWidget: React.FC<AccountWidgetProps> = () => {
  const okoWallet = useSDKState((state) => state.oko_cosmos)?.okoWallet;
  const [signingInState, setSigningInState] = useState<SigningInState>({
    status: "ready",
  });

  const { email, publicKey, isSignedIn } = useUserInfoState();

  // TODO: add other login methods, and update the type accordingly
  const [loginMethod] = useState<
    "email" | "google" | "telegram" | "x" | "apple"
  >("google");

  async function handleSignIn(
    method: "email" | "google" | "telegram" | "x" | "apple",
    email?: string,
  ) {
    if (!okoWallet) {
      console.error("eWallet is not initialized");
      return;
    }

    if (method !== "google") {
      console.error("Unsupported login method atm: %s", method);
      return;
    }

    try {
      setSigningInState({ status: "signing-in" });
      await okoWallet.signIn("google");

      setSigningInState({ status: "ready" });
    } catch (error: any) {
      console.error("sign in fail, err: %s", error);

      const errorMessage =
        error instanceof Error ? error.message : "Login failed";

      setSigningInState({ status: "failed", error: errorMessage });
    }
  }

  async function handleRetry() {
    setSigningInState({ status: "ready" });
  }

  async function handleSignOut() {
    if (okoWallet) {
      await okoWallet.signOut();
    } else {
      console.error("EWallet is not initialized");
    }
  }

  if (!okoWallet) {
    return <>Loading...</>;
  }

  if (signingInState.status === "signing-in") {
    return <AuthProgressWidget method={loginMethod} status="loading" />;
  }

  if (signingInState.status === "failed") {
    return (
      <AuthProgressWidget
        method={loginMethod}
        status="failed"
        onRetry={handleRetry}
      />
    );
  }

  if (isSignedIn) {
    return (
      <AccountInfoWidget
        type={loginMethod}
        email={email || ""}
        publicKey={publicKey || ""}
        onSignOut={handleSignOut}
      />
    );
  }

  return <LoginWidget onSignIn={handleSignIn} />;
};

export interface AccountWidgetProps {}
