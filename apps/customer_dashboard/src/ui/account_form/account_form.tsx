"use client";

import { ReactNode, FormEvent } from "react";
import { Button } from "@oko-wallet/ewallet-common-ui/button";

import styles from "./account_form.module.scss";

interface AccountFormProps {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  disabled?: boolean;
  submitText?: string;
}

export const AccountForm = ({
  onSubmit,
  children,
  disabled = false,
  submitText = "Submit",
}: AccountFormProps) => (
  <form className={styles.wrapper} onSubmit={onSubmit}>
    {children}

    <Button type="submit" disabled={disabled} fullWidth>
      {submitText}
    </Button>
  </form>
);
