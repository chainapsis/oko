import React, { useState } from "react";
import { useSDKState } from "@oko-wallet-demo-web/state/sdk";
import { useUserInfoState } from "@oko-wallet-demo-web/state/user_info";
import { AuthProgressWidget } from "./auth_progress_widget";
import { AccountInfoWidget } from "./account_info_widget";
import {
  type EmailLoginState,
  LoginWidget,
} from "../login_widget/login_widget";

type SigningInState =
  | { status: "ready" }
  | { status: "signing-in" }
  | { status: "failed"; error: string };

const initialEmailLoginState: EmailLoginState = {
  stage: "enter-email",
  email: "",
};

export const AccountWidget: React.FC<AccountWidgetProps> = () => {
  const okoWallet = useSDKState((state) => state.oko_cosmos)?.okoWallet;
  const [signingInState, setSigningInState] = useState<SigningInState>({
    status: "ready",
  });
  const [emailLoginState, setEmailLoginState] = useState<EmailLoginState>(
    initialEmailLoginState,
  );
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(
    null,
  );
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(
    null,
  );
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const email = useUserInfoState((state) => state.email);
  const publicKey = useUserInfoState((state) => state.publicKey);
  const isSignedIn = useUserInfoState((state) => state.isSignedIn);
  const clearUserInfo = useUserInfoState((state) => state.clearUserInfo);

  // TODO: add other login methods, and update the type accordingly
  const [loginMethod, setLoginMethod] = useState<
    "email" | "google" | "telegram" | "x" | "apple"
  >("google");

  async function handleSignIn(
    method: "email" | "google" | "telegram" | "x" | "apple",
    email?: string,
  ) {
    setLoginMethod(method);

    if (!okoWallet) {
      console.error("eWallet is not initialized");
      return;
    }

    if (method === "email") {
      const targetEmail = email?.trim() ?? "";

      if (!targetEmail) {
        setEmailErrorMessage("email is required");
        return;
      }

      setEmailErrorMessage(null);
      setEmailStatusMessage("Sending authentication code...");
      setEmailLoginState({
        stage: "sending-code",
        email: targetEmail,
      });

      try {
        await okoWallet.startEmailSignIn(targetEmail);

        setEmailLoginState({
          stage: "receive-code",
          email: targetEmail,
        });
        setEmailStatusMessage("Authentication code sent to your email.");
      } catch (error: any) {
        console.error("Failed to send Auth0 email code", error);

        setEmailLoginState({
          stage: "enter-email",
          email: targetEmail,
        });
        const message =
          error instanceof Error
            ? error.message
            : "Failed to send authentication code";
        setEmailErrorMessage(message);
        setEmailStatusMessage(null);
      }

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
    setEmailLoginState(initialEmailLoginState);
    setEmailStatusMessage(null);
    setEmailErrorMessage(null);
    setIsVerifyingCode(false);
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

  function handleEmailChange(inputEmail: string) {
    setEmailLoginState({
      stage: "enter-email",
      email: inputEmail,
    });
    setEmailStatusMessage(null);
    setEmailErrorMessage(null);
    setIsVerifyingCode(false);
  }

  async function handleVerifyEmailCode(code: string) {
    if (!okoWallet) {
      console.error("eWallet is not initialized");
      return;
    }

    setLoginMethod("email");

    const targetEmail = emailLoginState.email.trim();
    if (!targetEmail) {
      setEmailErrorMessage("email is required");
      return;
    }

    if (!code.trim()) {
      setEmailErrorMessage("authentication code is required");
      return;
    }

    try {
      setSigningInState({ status: "signing-in" });
      setEmailErrorMessage(null);
      setEmailStatusMessage("Verifying authentication code...");
      setIsVerifyingCode(true);

      await okoWallet.completeEmailSignIn(targetEmail, code.trim());

      setEmailStatusMessage("Authentication code verified");
      setEmailErrorMessage(null);
      setSigningInState({ status: "ready" });
    } catch (error: any) {
      console.error("Failed to verify Auth0 email code", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to verify authentication code";
      setEmailErrorMessage(message);
      setEmailStatusMessage(null);
      setSigningInState({
        status: "failed",
        error: message,
      });
    } finally {
      setIsVerifyingCode(false);
    }
  }

  return (
    <LoginWidget
      onSignIn={handleSignIn}
      emailLoginState={emailLoginState}
      onEmailChange={handleEmailChange}
      onVerifyEmailCode={handleVerifyEmailCode}
      emailStatusMessage={emailStatusMessage}
      emailErrorMessage={emailErrorMessage}
      isEmailVerificationInProgress={isVerifyingCode}
    />
  );
};

export interface AccountWidgetProps {}
