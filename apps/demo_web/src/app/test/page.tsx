"use client";

import React, { useEffect, useMemo, useState } from "react";
import auth0 from "auth0-js";

const AUTH0_DOMAIN = "dev-0v00qjwpomau3ldk.us.auth0.com";
const AUTH0_CLIENT_ID = "AMtmlNKxJiNY7abqewmq9mjERf2TOlfo";
const AUTH0_EMAIL_CONNECTION = "email";
const AUTH0_SCOPE = "openid profile email";

type Stage = "enter-email" | "enter-code" | "complete";

export default function Auth0TestPage(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<Stage>("enter-email");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authResult, setAuthResult] = useState<auth0.Auth0DecodedHash | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const webAuth = useMemo(
    () =>
      new auth0.WebAuth({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        responseType: "token id_token",
        scope: AUTH0_SCOPE,
        redirectUri:
          typeof window !== "undefined"
            ? `${window.location.origin}/test`
            : undefined,
        audience: `https://${AUTH0_DOMAIN}/userinfo`,
      }),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
      return;
    }

    webAuth.parseHash({ hash }, (err, result) => {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search,
      );

      if (err) {
        setErrorMessage(
          err.description ?? err.error_description ?? String(err),
        );
        setIsVerifying(false);
        return;
      }

      if (result) {
        setAuthResult(result);
        setStatusMessage("Authentication completed successfully.");
        setStage("complete");
      }
      setIsVerifying(false);
    });
  }, [webAuth]);

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage(null);
    setStatusMessage(null);

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsSending(true);
    webAuth.passwordlessStart(
      {
        connection: AUTH0_EMAIL_CONNECTION,
        email,
        send: "code",
      },
      (err) => {
        setIsSending(false);
        if (err) {
          setErrorMessage(
            err.description ?? err.error_description ?? String(err),
          );
          return;
        }

        setStatusMessage("Authentication code sent to your email.");
        setStage("enter-code");
      },
    );
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage(null);
    setStatusMessage(null);

    if (!code) {
      setErrorMessage("Please enter the authentication code.");
      return;
    }

    setIsVerifying(true);
    webAuth.passwordlessLogin(
      {
        connection: AUTH0_EMAIL_CONNECTION,
        email,
        verificationCode: code,
      },
      (err) => {
        if (err) {
          setIsVerifying(false);
          setErrorMessage(
            err.description ?? err.error_description ?? String(err),
          );
        }
      },
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0d0d0d",
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#1a1a1a",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 20px 45px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: "12px" }}>
          Auth0 Email OTP Login
        </h1>
        <p style={{ marginBottom: "24px", color: "#bbbbbb" }}>
          Enter your email address to receive an OTP for authentication.
        </p>

        {errorMessage && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              background: "rgba(255, 75, 75, 0.15)",
              color: "#ff6b6b",
              marginBottom: "20px",
            }}
          >
            {errorMessage}
          </div>
        )}

        {statusMessage && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              background: "rgba(80, 200, 120, 0.15)",
              color: "#4cd964",
              marginBottom: "20px",
            }}
          >
            {statusMessage}
          </div>
        )}

        {stage === "enter-email" && (
          <form onSubmit={handleSendCode}>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: "8px" }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #333",
                background: "#101010",
                color: "#fafafa",
                marginBottom: "16px",
              }}
            />
            <button
              type="submit"
              disabled={isSending}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: "#5f5cff",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                opacity: isSending ? 0.6 : 1,
              }}
            >
              {isSending ? "Sending..." : "Send Authentication Code"}
            </button>
          </form>
        )}

        {stage === "enter-code" && (
          <form onSubmit={handleVerifyCode}>
            <label
              htmlFor="code"
              style={{ display: "block", marginBottom: "8px" }}
            >
              Authentication Code Received by Email
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #333",
                background: "#101010",
                color: "#fafafa",
                letterSpacing: "0.15em",
                marginBottom: "16px",
              }}
            />
            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: "#5f5cff",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                opacity: isVerifying ? 0.6 : 1,
              }}
            >
              {isVerifying ? "Verifying..." : "Verify Authentication Code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("enter-email");
                setCode("");
                setStatusMessage(null);
                setErrorMessage(null);
              }}
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #333",
                background: "transparent",
                color: "#bbbbbb",
                cursor: "pointer",
              }}
            >
              Re-enter Email
            </button>
          </form>
        )}

        {stage === "complete" && (
          <div>
            <p style={{ marginBottom: "16px" }}>
              Login successful. Check the issued token information.
            </p>
            <pre
              style={{
                background: "#111",
                padding: "16px",
                borderRadius: "12px",
                overflowX: "auto",
                fontSize: "0.85rem",
                lineHeight: 1.5,
                border: "1px solid #222",
              }}
            >
              {JSON.stringify(authResult, null, 2)}
            </pre>
            <button
              type="button"
              onClick={() => {
                setStage("enter-email");
                setEmail("");
                setCode("");
                setStatusMessage(null);
                setErrorMessage(null);
                setAuthResult(null);
              }}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #333",
                background: "transparent",
                color: "#bbbbbb",
                cursor: "pointer",
              }}
            >
              Re-test
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
