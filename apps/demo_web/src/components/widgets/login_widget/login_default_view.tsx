import { type FC, Fragment, useEffect, useState } from "react";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { GoogleIcon } from "@oko-wallet/oko-common-ui/icons/google_icon";
import { Logo } from "@oko-wallet/oko-common-ui/logo";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { ExternalLinkOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/external_link_outlined";
import { ChevronRightIcon } from "@oko-wallet/oko-common-ui/icons/chevron_right";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { TelegramIcon } from "@oko-wallet/oko-common-ui/icons/telegram_icon";
import { XIcon } from "@oko-wallet/oko-common-ui/icons/x_icon";
import { AppleIcon } from "@oko-wallet/oko-common-ui/icons/apple_icon";
import { MailboxIcon } from "@oko-wallet/oko-common-ui/icons/mailbox";
import { OkoLogoIcon } from "@oko-wallet-common-ui/icons/oko_logo_icon";

import styles from "./login_widget.module.scss";
import type { EmailLoginState } from "./login_widget";

export interface LoginDefaultViewProps {
  onSignIn: (
    method: "email" | "google" | "telegram" | "x" | "apple",
    email?: string,
  ) => void;
  emailLoginState: EmailLoginState;
  onEmailChange: (email: string) => void;
  onShowSocials: () => void;
  onVerifyEmailCode: (code: string) => void;
  statusMessage?: string | null;
  errorMessage?: string | null;
  isVerifyingCode?: boolean;
}

export const LoginDefaultView: FC<LoginDefaultViewProps> = ({
  onSignIn,
  emailLoginState,
  onEmailChange,
  onShowSocials,
  onVerifyEmailCode,
  statusMessage,
  errorMessage,
  isVerifyingCode = false,
}) => {
  const { stage, email } = emailLoginState;
  const [code, setCode] = useState("");
  const isSending = stage === "sending-code";
  const isAwaitingCode = stage === "receive-code";
  const isNextDisabled =
    isSending || isVerifyingCode || email.trim().length === 0;
  const isVerifyDisabled = isVerifyingCode || code.trim().length === 0;

  useEffect(() => {
    if (stage === "enter-email") {
      setCode("");
    }
  }, [stage]);

  return (
    <Fragment>
      <div className={styles.logoWrapper}>
        <Logo theme={"light"} width={84} height={32} />
      </div>

      <Button
        variant="secondary"
        size="md"
        fullWidth
        onClick={() => onSignIn("google")}
      >
        <GoogleIcon width={20} height={20} />
        Google
      </Button>

      <div className={styles.dividerRow}>
        <div className={styles.line} />
        <Typography tagType="span" size="xs" weight="medium" color="quaternary">
          Coming soon
        </Typography>
        <div className={styles.line} />
      </div>

      <div className={styles.loginMethodsWrapper}>
        <div className={styles.emailLoginMethod}>
          <MailboxIcon size={20} color={"var(--fg-quaternary)"} />
          <input
            placeholder="your@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={styles.emailInput}
            type="email"
            disabled={isSending || isVerifyingCode}
          />
          <Button
            variant="ghost"
            size="md"
            className={styles.loginButton}
            onClick={() => onSignIn("email", email)}
            disabled={isNextDisabled}
          >
            {isSending ? "Sending..." : isAwaitingCode ? "Resend" : "Next"}
          </Button>
        </div>

        {isAwaitingCode ? (
          <>
            <Spacing height={12} />
            <div className={styles.emailLoginMethod}>
              <MailboxIcon size={20} color={"var(--fg-quaternary)"} />
              <input
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={styles.emailInput}
                type="text"
                inputMode="numeric"
                disabled={isVerifyingCode}
              />
              <Button
                variant="ghost"
                size="md"
                className={styles.loginButton}
                onClick={() => onVerifyEmailCode(code)}
                disabled={isVerifyDisabled}
              >
                {isVerifyingCode ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </>
        ) : null}

        {(statusMessage || errorMessage) && (
          <div className={styles.statusMessage}>
            {statusMessage ? (
              <Typography size="xs" weight="medium" color="secondary">
                {statusMessage}
              </Typography>
            ) : null}
            {errorMessage ? (
              <Typography size="xs" weight="medium" color="error-primary">
                {errorMessage}
              </Typography>
            ) : null}
          </div>
        )}

        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onShowSocials}
          disabled={true} // TODO: Remove this once we have other social login implemented
        >
          <div className={styles.socialIconWrapper}>
            <XIcon size={16} />
            <TelegramIcon size={16} />
            <AppleIcon size={16} />
          </div>
          <Typography
            size="sm"
            weight="semibold"
            color="secondary"
            style={{ padding: "0 2px" }}
          >
            Other Socials
          </Typography>
          <ChevronRightIcon size={20} color={"var(--fg-quaternary)"} />
        </Button>
      </div>

      <Spacing height={28} />

      <div className={styles.getSupportRow}>
        <OkoLogoIcon width={37} height={14} theme={"light"} />
        <a
          href="https://help.keplr.app/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.supportLink}
        >
          <Typography size="xs" weight="medium" color="secondary">
            Get support
          </Typography>
          <ExternalLinkOutlinedIcon color={"var(--fg-quaternary-hover)"} />
        </a>
      </div>
    </Fragment>
  );
};
