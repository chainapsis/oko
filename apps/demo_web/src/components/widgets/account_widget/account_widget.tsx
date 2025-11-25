import React, { useState } from "react";
import { useSDKState } from "@oko-wallet-demo-web/state/sdk";
import { useUserInfoState } from "@oko-wallet-demo-web/state/user_info";
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
  const email = useUserInfoState((state) => state.email);
  const publicKey = useUserInfoState((state) => state.publicKey);
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);
  const clearUserInfo = useUserInfoState((state) => state.clearUserInfo);

  // TODO: add other login methods, and update the type accordingly
  const [loginMethod, setLoginMethod] = useState<
    "google" | "telegram" | "x" | "apple"
  >("google");

  async function handleSignIn(method: "google" | "telegram" | "x" | "apple") {
    setLoginMethod(method);

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
    if (!okoWallet) {
      console.error("EWallet is not initialized");
      return;
    }

    await okoWallet.signOut();
    clearUserInfo();
    setLoginMethod("google");
    setSigningInState({ status: "ready" });
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
