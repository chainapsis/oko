"use client";

import React, { useEffect, useState } from "react";
import { LoadingIcon } from "@oko-wallet/oko-common-ui/icons/loading";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { OkoLogoIcon } from "@oko-wallet-common-ui/icons/oko_logo_icon";
import { ErrorIcon } from "@oko-wallet/oko-common-ui/icons/error_icon";
import type { Theme } from "@oko-wallet/oko-common-ui/theme";

import styles from "@oko-wallet-attached/components/google_callback/google_callback.module.scss";
import { getSystemTheme } from "@oko-wallet-attached/components/google_callback/theme";
import { setColorScheme } from "@oko-wallet-attached/components/attached_initialized/color_scheme";
import {
  getAuth0WebAuth,
  AUTH0_CONNECTION,
} from "@oko-wallet-attached/config/auth0";

export const Auth0Popup: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const systemTheme = getSystemTheme();
    setColorScheme(systemTheme);
    setTheme(systemTheme);
  }, []);

  useEffect(() => {
    const webAuth = getAuth0WebAuth();
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    const code = params.get("code");
    const nonce = params.get("nonce");
    const state = params.get("state");

    if (!email || !code || !nonce || !state) {
      setError("Missing Auth0 parameters in popup.");
      return;
    }

    webAuth.passwordlessLogin(
      {
        connection: AUTH0_CONNECTION,
        email,
        verificationCode: code,
        redirectUri: `${window.location.origin}/auth0/callback`,
        responseType: "token id_token",
        scope: "openid profile email",
        nonce,
        state,
      },
      (err) => {
        if (err) {
          setError(
            err.error_description ??
              err.description ??
              err.error ??
              "Auth0 verification failed.",
          );
        }
      },
    );
  }, []);

  return (
    <div className={`${styles.wrapper} ${styles.wrapperForSystemTheme}`}>
      <OkoLogoIcon width={115} height={44} theme={theme} />
      <Spacing height={56} />
      {error ? <ErrorMessage error={error} /> : <LoadingMessage />}
      <Spacing height={60} />
    </div>
  );
};

const LoadingMessage: React.FC = () => (
  <>
    <LoadingIcon
      size={50}
      className={styles.loadingIcon}
      backgroundColor="var(--bg-tertiary)"
      color="var(--fg-brand-primary)"
    />
    <Spacing height={19} />
    <Typography size="lg" weight="medium" color="secondary">
      Redirecting to Auth0...
    </Typography>
  </>
);

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <>
    <div className={styles.errorIconContainer}>
      <div className={styles.ring1} />
      <div className={styles.ring2} />
      <ErrorIcon size={28} color="var(--fg-error-primary)" />
    </div>
    <Spacing height={32} />
    <Typography size="sm" weight="medium" color="error-primary">
      {error}
    </Typography>
  </>
);
