import cn from "classnames";
import type { ButtonHTMLAttributes, FC, PropsWithChildren } from "react";

import { LoadingIcon } from "@oko-wallet-common-ui/icons/loading";

import styles from "./button.module.scss";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  isLoading = false,
  className,
  children,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;
  const useDisabledStyles = disabled && !isLoading;

  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        {
          [styles.fullWidth]: fullWidth,
          [styles.disabled]: useDisabledStyles,
          [styles.loading]: isLoading,
        },
        className,
      )}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading && (
        <LoadingIcon
          size={size === "lg" ? 20 : 16}
          className={styles.loadingIcon}
        />
      )}
      {children}
    </button>
  );
};
