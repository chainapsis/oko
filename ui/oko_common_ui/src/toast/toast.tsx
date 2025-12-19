"use client";

import React, { type MouseEvent } from "react";

import { CheckCircleOutlinedIcon } from "@oko-wallet-common-ui/icons/check_circle_outlined";
import { ErrorIcon } from "@oko-wallet-common-ui/icons/error_icon";
import { WarningIcon } from "@oko-wallet-common-ui/icons/warning_icon";
import { InfoCircleIcon } from "@oko-wallet-common-ui/icons/info_circle";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { XCloseIcon } from "@oko-wallet-common-ui/icons/x_close";
import styles from "./toast.module.scss";

export type ToastVariant = "success" | "error" | "warning" | "info";
export type ToastItemProps = {
  title?: string;
  description?: string;
  variant: ToastVariant;
};

const SuccessToastIcon = () => {
  return (
    <div className={styles.successIcon}>
      <div className={styles.successIconOuterRing1} />
      <div className={styles.successIconOuterRing2} />
      <CheckCircleOutlinedIcon size={20} />
    </div>
  );
};

const ToastIcon: React.FC<{ variant: ToastVariant }> = ({ variant }) => {
  if (variant === "success") {
    return <SuccessToastIcon />;
  }
  if (variant === "error") {
    return <ErrorIcon size={20} />;
  }
  if (variant === "warning") {
    return <WarningIcon size={20} />;
  }
  return <InfoCircleIcon size={20} />;
};

export const Toast: React.FC<ToastItemProps> = ({
  title,
  description,
  variant,
}) => {
  return (
    <div
      className={styles.toastInner}
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
    >
      <ToastIcon variant={variant} />
      {title && (
        <Typography size="sm" weight="semibold" color="primary">
          {title}
        </Typography>
      )}
      {/* TODO: add description, now there is no description in the design*/}
      {/* {description && <div className={styles.description}>{description}</div>} */}
    </div>
  );
};

export const ToastCloseButton = ({
  closeToast,
}: {
  closeToast: (e: MouseEvent<HTMLElement>) => void;
}) => {
  return (
    <button className={styles.closeButton} onClick={closeToast}>
      <XCloseIcon color="var(--fg-quaternary)" size={20} />
    </button>
  );
};
