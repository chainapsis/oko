"use client";

import React, { useEffect, useState } from "react";

import {
  exchangeCodeForToken,
  refreshAccessToken,
  getTwitterUserInfo,
  type TwitterUserInfo,
} from "../utils/twitter-oauth";

type TokenResult = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

export default function TwitterOAuthCallbackPage(): React.ReactElement {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "exchanging" | "verifying"
  >("loading");
  const [error, setError] = useState<string | null>(null);
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null);
  const [refreshResult, setRefreshResult] = useState<TokenResult | null>(null);
  const [userInfo, setUserInfo] = useState<TwitterUserInfo | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleCallback = async () => {
      try {
        // Extract code and state from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");
        const errorParam = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        // Handle errors
        if (errorParam) {
          setError(
            errorDescription ||
              errorParam ||
              "An error occurred during authentication.",
          );
          setStatus("error");
          return;
        }

        if (!code) {
          setError("Authorization code is missing.");
          setStatus("error");
          return;
        }

        // Verify saved state and code_verifier
        const savedState = localStorage.getItem("twitter_state");
        const codeVerifier = localStorage.getItem("twitter_code_verifier");

        if (!codeVerifier) {
          setError("Code verifier is missing. Please start over.");
          setStatus("error");
          return;
        }

        if (savedState !== state) {
          setError("State values do not match. Possible CSRF attack.");
          setStatus("error");
          return;
        }

        // Exchange token
        setStatus("exchanging");
        const result = await exchangeCodeForToken(code, codeVerifier);
        setTokenResult(result);

        // Clean up stored values
        localStorage.removeItem("twitter_state");
        localStorage.removeItem("twitter_code_verifier");

        // Store refresh token if available
        if (result.refresh_token) {
          localStorage.setItem("twitter_refresh_token", result.refresh_token);
        }

        // Get user info
        setStatus("verifying");
        const user = await getTwitterUserInfo(result.access_token);
        setUserInfo(user);
        setStatus("success");
      } catch (err) {
        console.error("Callback error:", err);
        let errorMessage = err instanceof Error ? err.message : String(err);

        // Additional guidance for CORS errors
        if (errorMessage.includes("CORS") || errorMessage.includes("fetch")) {
          errorMessage +=
            "\n\nNote: Twitter API may have CORS restrictions when called directly from the browser. It is recommended to use a server-side proxy or handle token exchange through Next.js API Routes.";
        }

        setError(errorMessage);
        setStatus("error");
      }
    };

    handleCallback();
  }, []);

  const handleRefreshToken = async () => {
    const refreshToken = localStorage.getItem("twitter_refresh_token");
    if (!refreshToken) {
      setError("Refresh token is missing.");
      return;
    }

    try {
      setError(null);
      const result = await refreshAccessToken(refreshToken);
      setRefreshResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleReset = () => {
    localStorage.removeItem("twitter_refresh_token");
    window.location.href = "/twitter-oauth";
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
          maxWidth: "700px",
          background: "#1a1a1a",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 20px 45px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: "12px" }}>
          Twitter OAuth Callback
        </h1>

        {status === "loading" && (
          <p style={{ color: "#bbbbbb" }}>Processing callback...</p>
        )}

        {status === "exchanging" && (
          <p style={{ color: "#bbbbbb" }}>Exchanging token...</p>
        )}

        {status === "verifying" && (
          <p style={{ color: "#bbbbbb" }}>Verifying user info...</p>
        )}

        {error && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              background: "rgba(255, 75, 75, 0.15)",
              color: "#ff6b6b",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {status === "success" && tokenResult && (
          <div>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(80, 200, 120, 0.15)",
                color: "#4cd964",
                marginBottom: "20px",
              }}
            >
              Authentication successful! Access token received.
            </div>

            {userInfo && (
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "12px",
                    color: "#e0e0e0",
                  }}
                >
                  X User Info
                </h2>
                <pre
                  style={{
                    background: "#111",
                    padding: "16px",
                    borderRadius: "12px",
                    overflowX: "auto",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    border: "1px solid #222",
                    marginBottom: "16px",
                  }}
                >
                  {JSON.stringify(userInfo, null, 2)}
                </pre>

                {userInfo.email && (
                  <div style={{ marginBottom: "24px" }}>
                    <h3
                      style={{
                        fontSize: "0.95rem",
                        marginBottom: "12px",
                        color: "#e0e0e0",
                      }}
                    >
                      Email Verification
                    </h3>
                    <p
                      style={{
                        marginBottom: "12px",
                        color: "#bbbbbb",
                        fontSize: "0.9rem",
                      }}
                    >
                      Email authenticated by X:{" "}
                      <strong style={{ color: "#fff" }}>
                        {userInfo.email}
                      </strong>
                    </p>
                    <div style={{ marginBottom: "12px" }}>
                      <label
                        htmlFor="verify-email"
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          color: "#bbbbbb",
                          fontSize: "0.9rem",
                        }}
                      >
                        Enter email address to verify:
                      </label>
                      <input
                        id="verify-email"
                        type="email"
                        value={verificationEmail}
                        onChange={(e) => setVerificationEmail(e.target.value)}
                        placeholder="user@example.com"
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #333",
                          background: "#101010",
                          color: "#fafafa",
                          marginBottom: "12px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!verificationEmail) {
                            setVerificationResult({
                              verified: false,
                              message: "Please enter an email address.",
                            });
                            return;
                          }

                          const isMatch =
                            verificationEmail.toLowerCase().trim() ===
                            userInfo.email?.toLowerCase().trim();
                          setVerificationResult({
                            verified: isMatch,
                            message: isMatch
                              ? "Email matches! ✅"
                              : "Email does not match. ❌",
                          });
                        }}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          border: "none",
                          background: "#1DA1F2",
                          color: "#fff",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Verify Email
                      </button>

                      {verificationResult && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px 14px",
                            borderRadius: "12px",
                            background: verificationResult.verified
                              ? "rgba(80, 200, 120, 0.15)"
                              : "rgba(255, 75, 75, 0.15)",
                            color: verificationResult.verified
                              ? "#4cd964"
                              : "#ff6b6b",
                          }}
                        >
                          {verificationResult.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!userInfo.email && (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: "rgba(255, 193, 7, 0.15)",
                      color: "#ffc107",
                      marginBottom: "20px",
                    }}
                  >
                    ⚠️ Unable to retrieve email information. The `users.email`
                    scope may be required or the account may not have an email
                    associated with it.
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <h2
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "12px",
                  color: "#e0e0e0",
                }}
              >
                Token Information
              </h2>
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
                {JSON.stringify(tokenResult, null, 2)}
              </pre>
            </div>

            <button
              type="button"
              onClick={handleReset}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #333",
                background: "transparent",
                color: "#bbbbbb",
                cursor: "pointer",
              }}
            >
              Test Again
            </button>
          </div>
        )}

        {status === "error" && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #333",
              background: "transparent",
              color: "#bbbbbb",
              cursor: "pointer",
            }}
          >
            Start Over
          </button>
        )}
      </div>
    </main>
  );
}
