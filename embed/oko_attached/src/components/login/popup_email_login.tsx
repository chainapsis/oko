import { type FC, type FormEvent } from "react";

import type { EmailLoginModalPayload } from "@oko-wallet/oko-sdk-core";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { OtpInput } from "@oko-wallet/oko-common-ui/otp_input";
import { MailboxIcon } from "@oko-wallet/oko-common-ui/icons/mailbox";
import { CloseButtonIcon } from "@oko-wallet/oko-common-ui/icons/close_button_icon";

import styles from "./popup_email_login.module.scss";
import { useEmailLogin } from "@oko-wallet-attached/components/login/use_email_login";

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
      <button
        type="button"
        className={styles.closeIconButton}
        aria-label="Close email login"
        onClick={handleClose}
      >
        <CloseButtonIcon size={14} color="#535862" />
      </button>
      <div className={styles.body}>
        {infoMessage && (
          <div className={styles.infoBanner}>
            <Typography size="sm" color="brand-primary">
              {infoMessage}
            </Typography>
          </div>
        )}

        {step === "enter_email" ? (
          <form className={styles.form} onSubmit={onSubmitEmail}>
            <div className={styles.fieldHeader}>
              <Typography size="sm" weight="medium">
                Enter your email
              </Typography>
            </div>

            <div className={styles.emailRow}>
              <MailboxIcon size={20} className={styles.emailIcon} />
              <input
                name="oko-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => {
                  resetError();
                  setEmail(event.target.value);
                }}
                className={styles.emailInput}
                autoFocus
              />
              <button
                className={styles.nextButton}
                type="submit"
                disabled={!isEmailValid || isSubmitting}
              >
                Submit
              </button>
            </div>

            {((email && !isEmailValid) || errorMessage) && (
              <Typography size="sm" color="error-primary">
                {!isEmailValid ? "Enter a valid email." : errorMessage}
              </Typography>
            )}

            <div className={styles.actions} />
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
              <button
                type="button"
                className={styles.changeEmailButton}
                onClick={handleBack}
              >
                Change
              </button>
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

            <div className={styles.actions} />
          </form>
        )}

        {step !== "enter_email" && errorMessage && (
          <Typography size="sm" color="error-primary" className={styles.error}>
            {errorMessage}
          </Typography>
        )}
      </div>
    </div>
  );
};
