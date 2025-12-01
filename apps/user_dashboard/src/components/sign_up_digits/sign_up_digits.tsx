"use client";

import React from "react";
import { OtpInput } from "@oko-wallet/oko-common-ui/otp_input";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import { useSignUpDigits } from "./use_sign_up_digits";
import styles from "./sign_up_digits.module.scss";
import { ResendCode } from "../resend_code/resend_code";
import { ExpiryTimer } from "../expiry_timer/expiry_timer";
import { EMAIL_VERIFICATION_TIMER_SECONDS } from "@oko-wallet-user-dashboard/constants";

export const SignUpDigits: React.FC = () => {
  const {
    digits,
    handleDigitsChange,
    handleComplete,
    isLoading,
    user,
    error,
    setError,
  } = useSignUpDigits();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div>Verifying...</div>
          </div>
        )}

        <div className={styles.content}>
          <Typography
            size="xl"
            weight="semibold"
            color="primary"
            className={styles.title}
          >
            Check your email
          </Typography>

          <div style={{ height: "0px" }} />
          <Typography
            size="md"
            weight="regular"
            color="primary"
            className={styles.description}
          >
            Enter the 6-digit code sent to <br /> {user?.email || "your email"}.
          </Typography>

          <div className={styles.otpSection}>
            <OtpInput
              length={6}
              value={digits}
              onChange={handleDigitsChange}
              onComplete={handleComplete}
              disabled={isLoading}
              isError={!!error}
            />
          </div>

          {error && (
            <Typography
              size="sm"
              weight="regular"
              color="error-primary"
              className={styles.errorMessage}
            >
              {error}
            </Typography>
          )}

          <ExpiryTimer duration={EMAIL_VERIFICATION_TIMER_SECONDS}>
            {({ timeDisplay, isExpired, resetTimer }) => (
              <div className={styles.resendSection}>
                <Typography
                  size="sm"
                  weight="regular"
                  color="primary"
                  className={styles.resendText}
                >
                  Didn't get the code?
                </Typography>
                <ResendCode
                  disabled={!isExpired}
                  onResendCode={resetTimer}
                  setError={setError}
                />
                {timeDisplay && (
                  <Typography
                    tagType="span"
                    size="md"
                    weight="regular"
                    color="secondary"
                    className={styles.timerText}
                  >
                    {timeDisplay}
                  </Typography>
                )}
              </div>
            )}
          </ExpiryTimer>
        </div>
      </div>
    </div>
  );
};
