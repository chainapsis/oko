"use client";

import { type FC, useEffect, useState } from "react";
import { useSDKState } from "@oko-wallet-user-dashboard/state/sdk";
import { useUserInfoState } from "@oko-wallet-user-dashboard/state/user_info";
import { AuthProgressWidget } from "./auth_progress_widget";
import { LoginWidget } from "../login_widget/login_widget";
import { Spinner } from "../../spinner/spinner";
import { paths } from "@oko-wallet-user-dashboard/paths";
import { useRouter } from "next/navigation";

import styles from "./account_widget.module.scss";

type SigningInState =
  | { status: "ready" }
  | { status: "signing-in" }
  | { status: "failed"; error: string };

export const AccountWidget: FC<AccountWidgetProps> = () => {
  const okoWallet = useSDKState((state) => state.oko_cosmos)?.okoWallet;
  const [signingInState, setSigningInState] = useState<SigningInState>({
    status: "ready",
  });
  const router = useRouter();
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);

  // TODO: add other login methods, and update the type accordingly
  const [loginMethod, setLoginMethod] = useState<
    "email" | "google" | "telegram" | "x" | "apple"
  >("google");

  async function handleSignIn(
    method: "email" | "google" | "telegram" | "x" | "apple",
  ) {
    setLoginMethod(method);

    if (!okoWallet) {
      console.error("okoWallet is not initialized");
      return;
    }

    if (method !== "google" && method !== "email") {
      console.error("Unsupported login method atm: %s", method);
      return;
    }

    try {
      setSigningInState({ status: "signing-in" });
      await okoWallet.signIn(method);

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
    return (
      <div className={styles.spinnerWrapper}>
        <Spinner size={30} />
      </div>
    );
  }

  // The email login loading progress is shown in the Attached popup, so we don't need to show that here
  if (signingInState.status === "signing-in" && loginMethod !== "email") {
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
