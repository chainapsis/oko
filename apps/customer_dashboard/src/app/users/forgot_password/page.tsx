"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@oko-wallet/oko-common-ui/input";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { EyeIcon } from "@oko-wallet/oko-common-ui/icons/eye";
import { EyeOffIcon } from "@oko-wallet/oko-common-ui/icons/eye_off";
import { AccountForm } from "@oko-wallet-ct-dashboard/ui";
import {
  requestForgotPassword,
  requestVerifyResetCode,
  requestResetPasswordConfirm,
} from "@oko-wallet-ct-dashboard/fetch/users";
import styles from "./page.module.scss";

enum Step {
  EMAIL = 0,
  CODE = 1,
  PASSWORD = 2,
  SUCCESS = 3,
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(Step.EMAIL);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await requestForgotPassword(email);
      if (res.success) {
        setStep(Step.CODE);
      } else {
        setError(res.msg || "Failed to send code");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await requestVerifyResetCode(email, code);
      if (res.success) {
        setStep(Step.PASSWORD);
      } else {
        setError(res.msg || "Invalid verification code");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await requestResetPasswordConfirm(email, code, password);
      if (res.success) {
        setStep(Step.SUCCESS);
      } else {
        setError(res.msg || "Failed to reset password");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <AccountForm
      onSubmit={handleEmailSubmit}
      disabled={!email || isLoading}
      submitText={isLoading ? "Sending..." : "Send Reset Code"}
    >
      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        requiredSymbol
      />
      <Spacing height={16} />
      {error && <Typography color="error-primary">{error}</Typography>}
    </AccountForm>
  );

  const renderCodeStep = () => (
    <AccountForm
      onSubmit={handleCodeSubmit}
      disabled={code.length !== 6 || isLoading}
      submitText={isLoading ? "Verifying..." : "Verify Code"}
    >
      <div className={styles.infoText}>
        We sent a 6-digit code to <strong>{email}</strong>.
      </div>
      <Spacing height={16} />
      <Input
        label="Verification Code"
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        fullWidth
        requiredSymbol
      />
      <Spacing height={16} />
      {error && <Typography color="error-primary">{error}</Typography>}
      <Spacing height={16} />
      <button
        type="button"
        className={styles.linkButton}
        onClick={() => {
          setStep(Step.EMAIL);
          setError(null);
        }}
      >
        Back to Email
      </button>
    </AccountForm>
  );

  const renderPasswordStep = () => (
    <AccountForm
      onSubmit={handlePasswordSubmit}
      disabled={!password || !confirmPassword || isLoading}
      submitText={isLoading ? "Resetting..." : "Reset Password"}
    >
      <Input
        label="New Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        requiredSymbol
        SideComponent={
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        }
      />
      <Spacing height={16} />
      <Input
        label="Confirm Password"
        type={showConfirm ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        requiredSymbol
        SideComponent={
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        }
      />
      <Spacing height={16} />
      {error && <Typography color="error-primary">{error}</Typography>}
    </AccountForm>
  );

  const renderSuccessStep = () => (
    <div className={styles.successContainer}>
      <Typography size="lg" weight="bold" color="primary">
        Password Reset Successful
      </Typography>
      <Spacing height={16} />
      <Typography color="secondary">
        You can now sign in with your new password.
      </Typography>
      <Spacing height={24} />
      <button
        className={styles.primaryButton}
        onClick={() => router.push("/users/sign_in")}
      >
        Go to Sign In
      </button>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Typography tagType="h1" size="display-sm" weight="semibold">
          Forgot Password
        </Typography>
        <Spacing height={24} />

        {step === Step.EMAIL && renderEmailStep()}
        {step === Step.CODE && renderCodeStep()}
        {step === Step.PASSWORD && renderPasswordStep()}
        {step === Step.SUCCESS && renderSuccessStep()}
      </div>
    </div>
  );
}
