import { useEffect, useMemo, useState } from "react";

import type {
  EmailLoginModalPayload,
  OAuthState,
} from "@oko-wallet/oko-sdk-core";
import { useMemoryState } from "@oko-wallet-attached/store/memory";
import {
  getAuth0WebAuth,
  AUTH0_CONNECTION,
} from "@oko-wallet-attached/config/auth0";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const LOG_PREFIX = "[attached][email_login]";
const EMAIL_STORAGE_KEY = "oko_email_login_pending_email";

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

  const oauthContext = data.oauth ?? null;
  const parsedOAuthState = useMemo<OAuthState | null>(() => {
    if (!oauthContext?.state) {
      return null;
    }

    try {
      return JSON.parse(oauthContext.state) as OAuthState;
    } catch (error) {
      console.error(`${LOG_PREFIX} failed to parse oauth state`, error);
      return null;
    }
  }, [oauthContext]);

  const webAuth = useMemo(() => getAuth0WebAuth(), []);

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

  const ensureOAuthContext = () => {
    if (!oauthContext || !parsedOAuthState) {
      console.error(`${LOG_PREFIX} missing oauth context for email login`);
      setErrorMessage(
        "Email login is not available right now. Please try again.",
      );
      return false;
    }

    if (!parsedOAuthState.apiKey || !parsedOAuthState.targetOrigin) {
      console.error(
        `${LOG_PREFIX} oauth state missing api key or target origin`,
      );
      setErrorMessage(
        "Email login is not available right now. Please try again.",
      );
      return false;
    }

    return true;
  };

  const requestCode = async () => {
    return new Promise<void>((resolve, reject) => {
      webAuth.passwordlessStart(
        {
          connection: AUTH0_CONNECTION,
          email: email.trim(),
          send: "code",
        },
        (err) => {
          if (err) {
            reject(
              new Error(
                err.error_description ??
                  err.description ??
                  err.error ??
                  "Failed to request code",
              ),
            );
            return;
          }

          resolve();
        },
      );
    });
  };

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
    if (!ensureOAuthContext()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      console.log(
        `${LOG_PREFIX} submitting email for code request`,
        email.trim(),
      );
      await requestCode();
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
    if (!ensureOAuthContext()) {
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
      await requestCode();
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
    if (!ensureOAuthContext()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setInfoMessage("Finish verification in the secure Auth0 window.");
    console.log(
      `${LOG_PREFIX} verifying code for ${email.trim()} (host: ${hostOrigin})`,
    );

    try {
      window.sessionStorage.setItem(EMAIL_STORAGE_KEY, email.trim());
    } catch (error) {
      console.warn(`${LOG_PREFIX} failed to set session storage`, error);
    }

    webAuth.passwordlessLogin(
      {
        connection: AUTH0_CONNECTION,
        email: email.trim(),
        verificationCode: otpDigits.join(""),
        redirectUri: `${window.location.origin}/auth0/callback`,
        responseType: "token id_token",
        scope: "openid profile email",
        nonce: oauthContext!.nonce,
        state: oauthContext!.state,
      },
      (err) => {
        if (err) {
          console.error(`${LOG_PREFIX} passwordlessLogin error`, err);
          setErrorMessage(
            err.error_description ??
              err.description ??
              err.error ??
              "Failed to verify the code",
          );
          setIsSubmitting(false);
        }
      },
    );
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
