"use client";

import type { FC } from "react";
import { Input } from "@oko-wallet/oko-common-ui/input";
import { Card } from "@oko-wallet/oko-common-ui/card";
import { Logo } from "@oko-wallet/oko-common-ui/logo";
import { Checkbox } from "@oko-wallet/oko-common-ui/checkbox";
import { AccountForm } from "@oko-wallet-ct-dashboard/ui";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { InfoModal } from "../info_modal/info_modal";

import styles from "./sign_in_form.module.scss";
import { useSignInForm } from "./use_sign_in_form";
import { GET_STARTED_URL } from "@oko-wallet-ct-dashboard/constants";

export const SignInForm: FC = () => {
  const {
    onSubmit,
    register,
    errors,
    isLoading,
    isValid,
    saveEmail,
    resetErrors,
    handleSaveEmailChange,
  } = useSignInForm();

  return (
    <Card className={styles.loginCard} variant="elevated" padding="lg">
      <div className={styles.cardHeader}>
        {/* NOTE: theme is hardcoded to light for now */}
        <Logo theme={"light"} />
      </div>

      <AccountForm
        onSubmit={onSubmit}
        disabled={isLoading || !isValid}
        submitText={isLoading ? "Signing in..." : "Login"}
      >
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          fullWidth
          error={errors.email?.message}
          resetError={() => resetErrors("email")}
          {...register("email")}
        />

        <Spacing height={20} />

        <Input
          label="Password"
          type="password"
          placeholder="Password"
          fullWidth
          error={errors.password?.message}
          resetError={() => resetErrors("password")}
          {...register("password")}
        />

        <Spacing height={20} />

        <Checkbox
          id="save_email"
          checked={saveEmail}
          onChange={handleSaveEmailChange}
          label="Remember me"
        />

        {errors.root && (
          <Typography
            color="error-primary"
            size="sm"
            className={styles.errorMessage}
          >
            {errors.root.message}
          </Typography>
        )}
        <Spacing height={20} />
      </AccountForm>

      <Spacing height={16} />

      <InfoModal
        title="Forgot password?"
        content="Please reach out to our parternship channel."
        renderTrigger={({ onOpen }) => (
          <button
            onClick={onOpen}
            className={styles.forgotButton}
            type="button"
          >
            <Typography size="sm" weight="medium" color="quaternary">
              Forgot password?
            </Typography>
          </button>
        )}
      />

      <div className={styles.betaSection}>
        <Typography
          size="sm"
          weight="medium"
          color="tertiary"
          className={styles.betaText}
        >
          Start your official integration to unlock all dashboard features!
        </Typography>
        <Typography
          tagType="a"
          href={GET_STARTED_URL}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          weight="semibold"
          color="tertiary"
          className={styles.earlyAccessLink}
        >
          Get Started
        </Typography>
      </div>
    </Card>
  );
};
