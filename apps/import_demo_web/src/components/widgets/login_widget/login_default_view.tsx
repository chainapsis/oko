import { type FC, Fragment, useState } from "react";
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

export interface LoginDefaultViewProps {
  onSignIn: (
    method: "email" | "google" | "telegram" | "x" | "apple",
    email?: string,
  ) => void;
  onShowSocials: () => void;
}

export const LoginDefaultView: FC<LoginDefaultViewProps> = ({
  onSignIn,
  onShowSocials,
}) => {
  const [email, setEmail] = useState("");

  return (
    <Fragment>
      <div className={styles.logoWrapper}>
        <Typography size="sm" weight="medium" color="primary">
          Login or sign up
        </Typography>
        <Logo theme={"light"} />
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
            onChange={(e) => setEmail(e.target.value)}
            className={styles.emailInput}
            type="email"
            disabled={true}
          />
          <Button
            variant="ghost"
            size="md"
            className={styles.loginButton}
            onClick={() => onSignIn("email", email)}
            disabled={true} // TODO: Remove this once we have email login implemented
          >
            Next
          </Button>
        </div>

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
        <div className={styles.byKeplrRow}>
          <OkoLogoIcon width={47} height={18} theme={"light"} />
          <Typography size="xs" weight="medium" color="secondary">
            by Keplr
          </Typography>
        </div>
        <a
          href="https://oko-wallet.canny.io/bug-reports"
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
