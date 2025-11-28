"use client";

import React, { useEffect, useState } from "react";
import { RedirectUriSearchParamsKey } from "@oko-wallet/oko-sdk-core";

// @TODO: replace with the actual bot name
const TELEGRAM_BOT_NAME = "auth234198_bot";

export const TelegramLogin: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get(RedirectUriSearchParamsKey.STATE);

    if (!stateParam) {
      setError("State parameter is missing");
      return;
    }

    try {
      JSON.parse(stateParam);
    } catch (err) {
      setError("Invalid state parameter");
      return;
    }

    const cleanBotName = TELEGRAM_BOT_NAME.replace(/^@+/, "").trim();

    const callbackUrl = `${window.location.origin}/telegram/callback?${RedirectUriSearchParamsKey.STATE}=${encodeURIComponent(stateParam)}`;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", cleanBotName);
    script.setAttribute("data-size", "medium");
    script.setAttribute("data-auth-url", callbackUrl);
    script.setAttribute("data-request-access", "write");
    script.async = true;

    script.onerror = () => {
      setError("Failed to load Telegram widget");
    };

    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        gap: "20px",
      }}
    >
      <h1 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
        Sign in with Telegram
      </h1>
      {error ? (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "4px",
            color: "#c00",
          }}
        >
          {error}
        </div>
      ) : (
        <div id="telegram-login-container" style={{ minHeight: "60px" }} />
      )}
    </div>
  );
};
