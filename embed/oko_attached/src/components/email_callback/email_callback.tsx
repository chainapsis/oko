"use client";

import React, { useEffect, useState } from "react";
import { LoadingIcon } from "@oko-wallet/oko-common-ui/icons/loading";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { OkoLogoIcon } from "@oko-wallet-common-ui/icons/oko_logo_icon";
import { ErrorIcon } from "@oko-wallet/oko-common-ui/icons/error_icon";
import { ExternalLinkOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/external_link_outlined";
import type { Theme } from "@oko-wallet/oko-common-ui/theme";

import styles from "@oko-wallet-attached/components/google_callback/google_callback.module.scss";
import { getSystemTheme } from "@oko-wallet-attached/components/google_callback/theme";
import { setColorScheme } from "@oko-wallet-attached/components/attached_initialized/color_scheme";
import { useEmailCallback } from "./use_callback";

export const EmailCallback: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const theme = getSystemTheme();
    setColorScheme(theme);
    setTheme(theme);
  }, []);

  const { error } = useEmailCallback();

  return (
    <div className={`${styles.wrapper} ${styles.wrapperForSystemTheme}`}>
      <OkoLogoIcon width={115} height={44} theme={theme} />
      <Spacing height={56} />
      {error ? <ErrorMessage error={error} /> : <SuccessMessage />}
      <Spacing height={60} />
    </div>
  );
};

const SuccessMessage: React.FC = () => {
  return (
    <>
      <LoadingIcon
        size={50}
        className={styles.loadingIcon}
        backgroundColor="var(--bg-tertiary)"
        color="var(--fg-brand-primary)"
      />
      <Spacing height={19} />
      <Typography size="lg" weight="medium" color="secondary">
        Redirecting...
      </Typography>
      <Spacing height={16} />
      <Typography size="xs" weight="medium" color="secondary">
        Received Auth0 tokens. Completing sign-in...
      </Typography>
    </>
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
        href="https://help.keplr.app/"
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

