import type { FC } from "react";

import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { ErrorIcon } from "@oko-wallet/oko-common-ui/icons/error_icon";

import styles from "./popup_error_view.module.scss";
import type { AppError } from "@oko-wallet-attached/errors";
import { useMemoryState } from "@oko-wallet-attached/store/memory";

export const PopupErrorView: FC<PopupErrorViewProps> = ({ error }) => {
  const { closeModal, clearError } = useMemoryState();

  const { errorCode } = parseError(error);

  const handleClose = () => {
    closeModal(error);
    clearError();
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <ErrorIcon size={32} color="var(--fg-error-primary)" />
      </div>
      <Typography tagType="h1" size="xl" weight="semibold">
        Something went wrong
      </Typography>
      <div className={styles.message}>
        {errorCode && (
          <Typography size="sm" color="secondary">
            Error code: {errorCode}
          </Typography>
        )}
      </div>
      <Button variant="primary" size="lg" onClick={handleClose}>
        Close
      </Button>
    </div>
  );
};

interface PopupErrorViewProps {
  error: AppError;
}

function parseError(error: AppError) {
  const detail = error.error;
  const errorCode = detail?.type ?? "unknown_error";

  return { errorCode };
}
