"use client";

import React, { useEffect, useState } from "react";
import { LoadingCircleIcon } from "@oko-wallet/oko-common-ui/icons/loading_circle_icon";
import { WarningIcon } from "@oko-wallet/oko-common-ui/icons/warning_icon";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import type { Theme } from "@oko-wallet/oko-common-ui/theme";

import styles from "@oko-wallet-attached/components/google_callback/google_callback.module.scss";
import telegramStyles from "@oko-wallet-attached/components/telegram/telegram.module.scss";
import { getSystemTheme } from "@oko-wallet-attached/components/google_callback/theme";
import { setColorScheme } from "@oko-wallet-attached/components/attached_initialized/color_scheme";
import { useTelegramCallback } from "./use_callback";

export const TelegramCallback: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const theme = getSystemTheme();
    setColorScheme(theme);
    setTheme(theme);
  }, []);

  const { error } = useTelegramCallback();

  if (error) {
    return (
      <div className={`${styles.wrapper} ${styles.wrapperForSystemTheme}`}>
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${styles.wrapperForSystemTheme}`}>
      <div className={telegramStyles.popupContainer}>
        <div className={telegramStyles.card}>
          <div className={telegramStyles.stepIndicator}>
            <div className={telegramStyles.stepProgressBar}>
              <div className={telegramStyles.stepNumberActive}>1</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="2"
                viewBox="0 0 30 2"
                fill="none"
                className={telegramStyles.stepLine}
              >
                <path
                  d="M0.614014 0.614258H28.614"
                  stroke="var(--colors-text-text-primary-900, #181D27)"
                  strokeWidth="1.22807"
                  strokeLinecap="round"
                />
              </svg>
              <div className={telegramStyles.stepNumberActive}>2</div>
            </div>
            <div className={telegramStyles.stepText}>Step 2/2</div>
          </div>
          <div className={telegramStyles.loadingContainer}>
            <LoadingCircleIcon size={62} />
            <div className={telegramStyles.signingText}>Signing in...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
  const handleClose = () => {
    window.close();
  };

  const errorCode = error || "unknown_error";
  const errorMessage = error || "An unknown error occurred.";

  return (
    <div className={telegramStyles.errorContainer}>
      <div className={telegramStyles.errorTopSection}>
        <div className={telegramStyles.errorIconWrapper}>
          <WarningIcon size={42} />
        </div>
        <Typography
          tagType="h1"
          className={telegramStyles.errorTitle}
          color="primary"
          size="lg"
        >
          Request failed
        </Typography>
        <div className={telegramStyles.errorMessageBox}>
          <div className={telegramStyles.errorTextRow}>
            <Typography
              size="sm"
              weight="semibold"
              className={telegramStyles.errorMessageText}
            >
              Error Code: {errorCode}
            </Typography>
          </div>
          <div className={telegramStyles.errorTextRow}>
            <Typography
              size="sm"
              weight="semibold"
              className={telegramStyles.errorMessageText}
            >
              {errorMessage}
            </Typography>
          </div>
        </div>
        <Typography
          tagType="a"
          href="https://oko-wallet.canny.io/bug-reports"
          target="_blank"
          rel="noopener noreferrer"
          className={telegramStyles.errorSupportLink}
          size="xs"
          weight="medium"
        >
          Get Support
        </Typography>
      </div>
      <div className={telegramStyles.errorBottomSection}>
        <button
          className={telegramStyles.errorCloseButton}
          onClick={handleClose}
        >
          <span>Close</span>
        </button>
      </div>
    </div>
  );
};
