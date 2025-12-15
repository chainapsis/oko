import { type FC, Fragment } from "react";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { GoogleIcon } from "@oko-wallet/oko-common-ui/icons/google_icon";
import { Logo } from "@oko-wallet/oko-common-ui/logo";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { MailboxIcon } from "@oko-wallet/oko-common-ui/icons/mailbox";

import styles from "./login_widget.module.scss";

export interface LoginDefaultViewProps {
  onSignIn: (method: "email" | "google" | "telegram" | "x" | "apple") => void;
  onShowSocials: () => void;
}

export const LoginDefaultView: FC<LoginDefaultViewProps> = ({
  onSignIn,
  onShowSocials,
}) => {
  return (
    <Fragment>
      <Logo theme="light" width={58} height={22} className={styles.logo} />

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

        {/* <Button
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
        </Button> */}
      </div>
    </Fragment>
  );
};
