"use client";

import React, { useEffect, useState } from "react";
import { RedirectUriSearchParamsKey } from "@oko-wallet/oko-sdk-core";

import { TELEGRAM_BOT_NAME } from "@oko-wallet-attached/config/telegram";
import styles from "@oko-wallet-attached/components/login/popup_email_login.module.scss";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { LoadingIcon } from "@oko-wallet/oko-common-ui/icons/loading";
import { Logo } from "@oko-wallet/oko-common-ui/logo";

export const TelegramLogin: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get(RedirectUriSearchParamsKey.STATE);
    const modalId = urlParams.get("modal_id");
    const hostOrigin = urlParams.get("host_origin");

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

    const callbackUrl = new URL(`${window.location.origin}/telegram/callback`);
    callbackUrl.searchParams.set(RedirectUriSearchParamsKey.STATE, stateParam);
    if (modalId) {
      callbackUrl.searchParams.set("modal_id", modalId);
    }
    if (hostOrigin) {
      callbackUrl.searchParams.set("host_origin", hostOrigin);
    }

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", cleanBotName);
    script.setAttribute("data-size", "medium");
    script.setAttribute("data-auth-url", callbackUrl.toString());
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
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <Logo theme="light" />
            <div className={styles.fieldHeader}>Continue with Telegram</div>
          </div>
          <div className={styles.cardBottom}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                width: "100%",
              }}
            >
              <Typography size="sm" color="secondary">
                Opening Telegram login...
              </Typography>
              {error ? (
                <Typography size="sm" color="error-primary">
                  {error}
                </Typography>
              ) : (
                <>
                  <LoadingIcon size={36} />
                  <div
                    id="telegram-login-container"
                    style={{
                      minHeight: 60,
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
