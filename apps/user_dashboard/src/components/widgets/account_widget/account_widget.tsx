"use client";

import React, { useEffect, useState } from "react";
import { useSDKState } from "@oko-wallet-user-dashboard/state/sdk";
import { useUserInfoState } from "@oko-wallet-user-dashboard/state/user_info";
import { AuthProgressWidget } from "./auth_progress_widget";
import { LoginWidget } from "../login_widget/login_widget";
import { Spinner } from "../../spinner/spinner";
import { paths } from "@oko-wallet-user-dashboard/paths";
import { useRouter } from "next/navigation";

type SigningInState =
  | { status: "ready" }
  | { status: "signing-in" }
  | { status: "failed"; error: string };

export const AccountWidget: React.FC<AccountWidgetProps> = () => {
  const okoWallet = useSDKState((state) => state.oko_cosmos)?.okoWallet;
  const [signingInState, setSigningInState] = useState<SigningInState>({
    status: "ready",
  });
  const router = useRouter();
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);

  // TODO: add other login methods, and update the type accordingly
  const [loginMethod, setLoginMethod] = useState<
    "google" | "telegram" | "x" | "apple"
  >("google");

  async function handleSignIn(method: "google" | "telegram" | "x" | "apple") {
    setLoginMethod(method);

    if (!okoWallet) {
      console.error("okoWallet is not initialized");
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

  useEffect(() => {
    if (isSignedIn) {
      router.push(paths.home);
    }
  }, [isSignedIn]);

  if (!okoWallet) {
    return <Spinner size={30} />;
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

  return <LoginWidget onSignIn={handleSignIn} />;
};

export interface AccountWidgetProps {}
