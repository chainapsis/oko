"use client";

import React, { useState } from "react";

import { startTwitterLogin } from "./utils/twitter-oauth";

export default function TwitterOAuthTestPage(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await startTwitterLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
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
          maxWidth: "500px",
          background: "#1a1a1a",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 20px 45px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: "12px" }}>
          Twitter (X) OAuth 2.0 Test
        </h1>
        <p style={{ marginBottom: "24px", color: "#bbbbbb" }}>
          Test Twitter authentication using OAuth 2.0 Authorization Code Flow
          with PKCE.
        </p>

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

        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              marginBottom: "12px",
              color: "#e0e0e0",
            }}
          >
            Setup Requirements
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              color: "#bbbbbb",
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              • Set Callback URL in Twitter Developer Portal:
              <br />
              <code
                style={{
                  background: "#101010",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                }}
              >
                http://localhost:3200/twitter-oauth/callback
              </code>
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={handleStartLogin}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "none",
            background: "#1DA1F2",
            color: "#fff",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
            fontSize: "1rem",
          }}
        >
          {isLoading ? "Redirecting..." : "Start Twitter Login"}
        </button>
      </div>
    </main>
  );
}
