import { type FC, type FormEvent } from "react";

import type { EmailLoginModalPayload } from "@oko-wallet/oko-sdk-core";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { Input } from "@oko-wallet/oko-common-ui/input";
import { OtpInput } from "@oko-wallet/oko-common-ui/otp_input";
import { XCloseIcon } from "@oko-wallet/oko-common-ui/icons/x_close";

import styles from "./email_login_modal.module.scss";
import { CommonModal } from "@oko-wallet-attached/components/modal_variants/common/common_modal";
import { useEmailLogin } from "./use_email_login";

interface EmailLoginModalProps {
  modalId: string;
  data: EmailLoginModalPayload["data"];
}

export const EmailLoginModal: FC<EmailLoginModalProps> = ({
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
    <CommonModal className={styles.modal}>
      <div className={styles.header}>
        <div>
          <Typography tagType="h2" size="lg" weight="semibold">
            Sign in with email
          </Typography>
          <Typography color="secondary" size="sm" className={styles.subtitle}>
            Authenticate inside the secure Oko iframe to keep credentials
            isolated from the host app.
          </Typography>
        </div>

        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close email login"
        >
          <XCloseIcon size={20} />
        </button>
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
            error={!email ? undefined : isEmailValid ? undefined : "Enter a valid email."}
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
        <Typography size="sm" color="error-primary" className={styles.errorText}>
          {errorMessage}
        </Typography>
      )}
    </CommonModal>
  );
};
