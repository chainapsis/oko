import type { FC } from "react";
import cn from "classnames";
import { GoogleIcon } from "@oko-wallet/oko-common-ui/icons/google_icon";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { TelegramIcon } from "@oko-wallet/oko-common-ui/icons/telegram_icon";
import { XIcon } from "@oko-wallet/oko-common-ui/icons/x_icon";
import { AppleIcon } from "@oko-wallet/oko-common-ui/icons/apple_icon";
import { MailboxIcon } from "@oko-wallet/oko-common-ui/icons/mailbox";

import styles from "./auth_progress_widget.module.scss";
import { Spinner } from "@oko-wallet-user-dashboard/components/spinner/spinner";

type AuthProgressWidgetProps = {
  method: "email" | "google" | "telegram" | "x" | "apple";
  status?: "loading" | "failed";
  onRetry?: () => void;
};

export const AuthProgressWidget: FC<AuthProgressWidgetProps> = ({
  method,
  status = "loading",
  onRetry,
}) => {
  const isFailed = status === "failed";

  return (
    <div className={cn(styles.signingInWrapper, { [styles.failed]: isFailed })}>
      <div className={styles.signingInCircle}>
        {method === "email" && (
          <MailboxIcon size={36} color="var(--fg-tertiary)" />
        )}
        {method === "google" && <GoogleIcon width={48} height={48} />}
        {method === "telegram" && <TelegramIcon size={48} />}
        {method === "x" && <XIcon size={48} />}
        {method === "apple" && <AppleIcon size={48} />}
        <Spinner
          size={62}
          className={styles.spinnerOverlay}
          status={isFailed ? "failed" : "loading"}
        />
      </div>
      <Spacing height={9} />
      {isFailed ? (
        <>
          <Typography size="md" weight="medium" color="primary">
            Login failed
          </Typography>
          {onRetry ? (
            <div className={styles.retryButton} onClick={onRetry}>
              <Typography size="sm" weight="semibold" color="brand-secondary">
                Retry
              </Typography>
            </div>
          ) : null}
        </>
      ) : (
        <Typography
          size="md"
          weight="medium"
          color="primary"
          className={styles.signingInText}
        >
          Signing in
        </Typography>
      )}
    </div>
  );
};
