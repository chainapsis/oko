import type { SMTPConfig } from "../admin";

export enum EmailVerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  EXPIRED = "EXPIRED",
}

export interface EmailVerification {
  email_verification_id: string;
  email: string;
  verification_code: string;
  status: EmailVerificationStatus;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmailVerificationRequest {
  email: string;
  verification_code: string;
  expires_at: Date;
}

export interface VerifyEmailRequest {
  email: string;
  verification_code: string;
}

export interface VerifyEmailResponse {
  is_verified: boolean;
}

export interface VerifyAndLoginRequest {
  email: string;
  verification_code: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  email: string;
  new_password: string;
  original_password: string;
}

export interface SendVerificationRequest {
  email: string;
  email_verification_expiration_minutes: number;
  from_email: string;
  smtp_config: SMTPConfig;
}

export interface ChangePasswordResponse {
  message: string;
}
