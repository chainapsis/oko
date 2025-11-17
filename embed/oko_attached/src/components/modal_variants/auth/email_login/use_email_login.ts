import { useEffect, useMemo, useState } from "react";

import type { EmailLoginModalPayload } from "@oko-wallet/oko-sdk-core";
import { useMemoryState } from "@oko-wallet-attached/store/memory";
import {
  persistEmailLoginResult,
  requestEmailLoginCode,
  verifyEmailLoginCode,
} from "@oko-wallet-attached/features/email_login";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const LOG_PREFIX = "[attached][email_login]";

export type EmailLoginModalStep = "enter_email" | "verify_code";

export interface UseEmailLoginArgs {
  modalId: string;
  data: EmailLoginModalPayload["data"];
}

interface UseEmailLoginResult {
  step: EmailLoginModalStep;
  email: string;
  setEmail: (value: string) => void;
  otpDigits: string[];
  setOtpDigits: (digits: string[]) => void;
  isEmailValid: boolean;
  isOtpComplete: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  infoMessage: string | null;
  resendTimer: number;
  handleSubmitEmail: () => Promise<void>;
  handleVerifyCode: () => Promise<void>;
  handleResendCode: () => Promise<void>;
  handleBack: () => void;
  handleClose: () => void;
  resetError: () => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function useEmailLogin({
  modalId,
  data,
}: UseEmailLoginArgs): UseEmailLoginResult {
  const closeModal = useMemoryState((state) => state.closeModal);
  const hostOrigin = useMemoryState((state) => state.hostOrigin);

  const [step, setStep] = useState<EmailLoginModalStep>("enter_email");
  const [email, setEmail] = useState(data.email_hint ?? "");
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => ""),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const isEmailValid = useMemo(() => isValidEmail(email), [email]);
  const isOtpComplete = useMemo(
    () =>
      otpDigits.filter((digit) => digit.trim().length > 0).length ===
        CODE_LENGTH && otpDigits.join("").length === CODE_LENGTH,
    [otpDigits],
  );

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendTimer]);

  const resetError = () => setErrorMessage(null);

  const handleClose = () => {
    console.log(`${LOG_PREFIX} modal closed by user`);
    closeModal({
      modal_type: "auth/email_login",
      modal_id: modalId,
      type: "reject",
    });
  };

  const handleSubmitEmail = async () => {
    if (!isEmailValid || isSubmitting) {
      return;
    }
    if (!hostOrigin) {
      console.warn(`${LOG_PREFIX} missing host origin for submit email step`);
      setErrorMessage("Missing host origin");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      console.log(
        `${LOG_PREFIX} submitting email for code request`,
        email.trim(),
      );
      await requestEmailLoginCode({
        email: email.trim(),
        hostOrigin,
      });
      setStep("verify_code");
      setInfoMessage(
        "We sent a 6-digit verification code to your email address.",
      );
      setOtpDigits(Array.from({ length: CODE_LENGTH }, () => ""));
      setResendTimer(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      const message =
        err instanceof Error ? err.message : "Failed to request the code.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isSubmitting || !hostOrigin) {
      if (!hostOrigin) {
        console.warn(`${LOG_PREFIX} missing host origin for resend`);
      }
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      console.log(
        `${LOG_PREFIX} resending verification code`,
        email.trim(),
        `(host: ${hostOrigin})`,
      );
      await requestEmailLoginCode({
        email: email.trim(),
        hostOrigin,
      });
      setInfoMessage("A new code was sent.");
      setResendTimer(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      const message =
        err instanceof Error ? err.message : "Failed to resend the code.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!hostOrigin) {
      console.warn(`${LOG_PREFIX} missing host origin for verify step`);
      setErrorMessage("Missing host origin");
      return;
    }
    if (!isOtpComplete || isSubmitting) {
      setErrorMessage("Enter the 6-digit verification code.");
      return;
    }

    const code = otpDigits.join("");

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      console.log(
        `${LOG_PREFIX} verifying code for ${email.trim()} (host: ${hostOrigin})`,
      );
      const result = await verifyEmailLoginCode({
        email: email.trim(),
        code,
        hostOrigin,
      });
      persistEmailLoginResult(hostOrigin, result);
      console.log(`${LOG_PREFIX} email verification success`, result.email);
      closeModal({
        modal_type: "auth/email_login",
        modal_id: modalId,
        type: "approve",
        data: {
          email: result.email,
        },
      });
    } catch (err: any) {
      const message =
        err instanceof Error ? err.message : "Failed to verify the code.";
      console.error(
        `${LOG_PREFIX} verification failed for ${email.trim()}`,
        err,
      );
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    console.log(`${LOG_PREFIX} user moved back to email entry step`);
    setStep("enter_email");
    setOtpDigits(Array.from({ length: CODE_LENGTH }, () => ""));
    setInfoMessage(null);
    setErrorMessage(null);
    setResendTimer(0);
  };

  console.debug(`${LOG_PREFIX} modal state`, {
    step,
    hostOrigin,
  });

  return {
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
  };
}
