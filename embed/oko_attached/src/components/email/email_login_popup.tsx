import { type FC, type FormEvent } from "react";
import type { EmailLoginModalPayload } from "@oko-wallet/oko-sdk-core";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { OtpInput } from "@oko-wallet/oko-common-ui/otp_input";
import { MailboxIcon } from "@oko-wallet/oko-common-ui/icons/mailbox";
import { Logo } from "@oko-wallet/oko-common-ui/logo";

import styles from "./email_login_popup.module.scss";
import { useEmailLogin } from "./use_email_login";

interface EmailLoginPopupProps {
  modalId: string;
  data: EmailLoginModalPayload["data"];
}

export const EmailLoginPopup: FC<EmailLoginPopupProps> = ({
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
      <div className={styles.body}>
        {step === "enter_email" ? (
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <Logo theme="light" />
              <div className={styles.fieldHeader}>
                Enter your email to continue
              </div>
            </div>
            <div className={styles.cardBottom}>
              <form className={styles.form} onSubmit={onSubmitEmail}>
                <div className={styles.emailRow}>
                  <div className={styles.emailInner}>
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
                </div>

                {errorMessage && (
                  <Typography size="sm" color="error-primary">
                    {errorMessage}
                  </Typography>
                )}

                <div className={styles.actions} />
              </form>
            </div>
          </div>
        ) : (
          <div className={styles.otpShell}>
            <form
              className={`${styles.form} ${styles.otpForm}`}
              onSubmit={onSubmitCode}
            >
              <div className={styles.otpPanel}>
                <div className={styles.otpTitle}>Check your email</div>
                <div className={styles.otpSubtitle}>
                  {`Enter the 6-digit code sent to ${email || "your email"}.`}
                </div>

                <div className={styles.otpInputRow}>
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
                </div>

                <div className={styles.resendRow}>
                  <span className={styles.resendText}>
                    Didn&apos;t get the code?
                  </span>
                  <button
                    type="button"
                    className={styles.resendLink}
                    disabled={resendTimer > 0 || isSubmitting}
                    onClick={() => {
                      resetError();
                      void handleResendCode();
                    }}
                  >
                    Resend
                  </button>
                  {resendTimer > 0 && (
                    <span
                      className={styles.resendTimer}
                    >{`${resendTimer}s`}</span>
                  )}
                </div>
              </div>

              <div className={styles.actions} />
            </form>
          </div>
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
