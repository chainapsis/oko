import { Button } from "@oko-wallet/oko-common-ui/button";
import { AppleIcon } from "@oko-wallet/oko-common-ui/icons/apple_icon";
import { ChevronRightIcon } from "@oko-wallet/oko-common-ui/icons/chevron_right";
import { ExternalLinkOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/external_link_outlined";
import { GoogleIcon } from "@oko-wallet/oko-common-ui/icons/google_icon";
import { MailboxIcon } from "@oko-wallet/oko-common-ui/icons/mailbox";
import { OkoLogoWithNameIcon } from "@oko-wallet/oko-common-ui/icons/oko_logo_with_name_icon";
import { TelegramIcon } from "@oko-wallet/oko-common-ui/icons/telegram_icon";
import { XIcon } from "@oko-wallet/oko-common-ui/icons/x_icon";
import { Logo } from "@oko-wallet/oko-common-ui/logo";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { type FC, Fragment } from "react";

import styles from "./login_widget.module.scss";
import { useThemeState } from "@oko-wallet-demo-web/state/theme";
import type { LoginMethod } from "@oko-wallet-demo-web/types/login";

export interface LoginDefaultViewProps {
  onSignIn: (method: LoginMethod) => void;
  onShowSocials: () => void;
}

export const LoginDefaultView: FC<LoginDefaultViewProps> = ({
  onSignIn,
  onShowSocials,
}) => {
  const theme = useThemeState((state) => state.theme);

  return (
    <Fragment>
      <div className={styles.logoWrapper}>
        <Logo theme={theme} width={84} height={32} />
      </div>

      <div className={styles.loginMethodsWrapper}>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => onSignIn("email")}
        >
          <MailboxIcon size={20} color={"var(--fg-tertiary)"} />
          <Spacing width={2} />
          Email
        </Button>

        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => onSignIn("google")}
        >
          <GoogleIcon width={20} height={20} />
          Google
        </Button>

        <Button variant="secondary" size="md" fullWidth onClick={onShowSocials}>
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
        <OkoLogoWithNameIcon width={52} height={20} theme={theme} />
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
