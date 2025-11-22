import { type FC, type FormEvent } from "react";

import type { EmailLoginModalPayload } from "@oko-wallet/oko-sdk-core";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { Input } from "@oko-wallet/oko-common-ui/input";
import { OtpInput } from "@oko-wallet/oko-common-ui/otp_input";
import { OkoLogoIcon } from "@oko-wallet-common-ui/icons/oko_logo_icon";

import styles from "./popup_email_login.module.scss";
import { useEmailLogin } from "@oko-wallet-attached/components/modal_variants/auth/email_login/use_email_login";

interface PopupEmailLoginProps {
  modalId: string;
  data: EmailLoginModalPayload["data"];
}

export const PopupEmailLogin: FC<PopupEmailLoginProps> = ({
  modalId,
  data,
}) => {
  const {
    step,
    email,
    setEmail,
    otpDigits,
    setOtpDigits,
    isEmailValid,
    isOtpComplete,
    isSubmitting,
    errorMessage,
    infoMessage,
    resendTimer,
    handleSubmitEmail,
    handleVerifyCode,
    handleResendCode,
    handleBack,
    handleClose,
    resetError,
  } = useEmailLogin({ modalId, data });

  const onSubmitEmail = (event: FormEvent) => {
    event.preventDefault();
    void handleSubmitEmail();
  };

  const onSubmitCode = (event: FormEvent) => {
    event.preventDefault();
    void handleVerifyCode();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <OkoLogoIcon width={110} height={42} />
        <Button
          variant="ghost"
          size="md"
          className={styles.closeButton}
          onClick={handleClose}
        >
          Cancel
        </Button>
      </header>

      <div className={styles.body}>
        <div>
          <Typography tagType="h1" size="xl" weight="semibold">
            Sign in with email
          </Typography>
          <Typography className={styles.subtitle} color="secondary" size="md">
            Authenticate inside the secure Oko popup to keep your account
            isolated from the host app.
          </Typography>
        </div>

        {infoMessage && (
          <div className={styles.infoBanner}>
            <Typography size="sm" color="brand-primary">
              {infoMessage}
            </Typography>
          </div>
        )}

        {step === "enter_email" ? (
          <form className={styles.form} onSubmit={onSubmitEmail}>
            <Input
              label="Email address"
              name="oko-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={
                !email
                  ? undefined
                  : isEmailValid
                    ? undefined
                    : "Enter a valid email."
              }
              resetError={resetError}
              fullWidth
              autoFocus
            />

            <div className={styles.actions}>
              <Button
                variant="secondary"
                type="button"
                onClick={handleClose}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!isEmailValid}
                isLoading={isSubmitting}
                fullWidth
              >
                Continue
              </Button>
            </div>
          </form>
        ) : (
          <form className={styles.form} onSubmit={onSubmitCode}>
            <div className={styles.codeHeader}>
              <div>
                <Typography size="sm" color="secondary">
                  Enter the 6-digit code sent to
                </Typography>
                <Typography size="md" weight="medium">
                  {email}
                </Typography>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="md"
                className={styles.changeEmailButton}
                onClick={handleBack}
              >
                Change
              </Button>
            </div>

            <OtpInput
              length={6}
              value={otpDigits}
              onChange={(digits) => {
                resetError();
                setOtpDigits(digits);
              }}
              disabled={isSubmitting}
              isError={!!errorMessage}
            />

            <div className={styles.resendRow}>
              <Typography size="sm" color="secondary">
                Didn&apos;t get the email?
              </Typography>
              <button
                type="button"
                className={styles.resendButton}
                disabled={resendTimer > 0 || isSubmitting}
                onClick={() => {
                  resetError();
                  void handleResendCode();
                }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
              </button>
            </div>

            <div className={styles.actions}>
              <Button
                variant="secondary"
                type="button"
                onClick={handleBack}
                fullWidth
              >
                Back
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!isOtpComplete}
                isLoading={isSubmitting}
                fullWidth
              >
                Sign in
              </Button>
            </div>
          </form>
        )}

        {errorMessage && (
          <Typography size="sm" color="error-primary" className={styles.error}>
            {errorMessage}
          </Typography>
        )}
      </div>
    </div>
  );
};
