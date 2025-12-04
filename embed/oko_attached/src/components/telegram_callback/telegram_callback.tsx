"use client";

import React, { useEffect, useState } from "react";
import { LoadingCircleIcon } from "@oko-wallet/oko-common-ui/icons/loading_circle_icon";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { ErrorIcon } from "@oko-wallet/oko-common-ui/icons/error_icon";
import { ExternalLinkOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/external_link_outlined";
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
  return (
    <>
      <div className={styles.errorIconContainer}>
        <div className={styles.ring1} />
        <div className={styles.ring2} />
        <ErrorIcon size={28} color="var(--fg-error-primary)" />
      </div>
      <Spacing height={32} />

      <a
        href="https://oko-wallet.canny.io/bug-reports"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.supportLink}
      >
        <Typography size="sm" weight="medium" color="secondary">
          Having problems?
        </Typography>
        <Typography
          className={styles.textUnderline}
          size="sm"
          weight="medium"
          color="secondary"
        >
          Get support
        </Typography>
        <ExternalLinkOutlinedIcon color="var(--fg-quaternary-hover)" />
      </a>

      <Spacing height={32} />
      <div className={styles.errorMessageContainer}>
        <Typography size="sm" weight="medium" color="error-primary">
          {error}
        </Typography>
      </div>
    </>
  );
};
