import { type Request, Router, type Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  SendVerificationRequest,
  VerifyAndLoginRequest,
  SignInRequest,
  ChangePasswordRequest,
  SendVerificationResponse,
  LoginResponse,
  ChangePasswordResponse,
} from "@oko-wallet/oko-types/ct_dashboard";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  getCTDUserWithCustomerAndPasswordHashByEmail,
  updateCustomerDashboardUserPassword,
  verifyCustomerDashboardUserEmail,
  getCTDUserWithCustomerByEmail,
} from "@oko-wallet/oko-pg-interface/customer_dashboard_users";
import { hashPassword, comparePassword } from "@oko-wallet/crypto-js";
import {
  verifyEmailCode,
  markCodeVerified,
} from "@oko-wallet/oko-pg-interface/email_verifications";
import { registry } from "@oko-wallet/oko-api-openapi";
import { ErrorResponseSchema } from "@oko-wallet/oko-api-openapi/common";
import {
  ChangePasswordRequestSchema,
  ChangePasswordSuccessResponseSchema,
  CustomerAuthHeaderSchema,
  LoginSuccessResponseSchema,
  SendVerificationRequestSchema,
  SendVerificationSuccessResponseSchema,
  SignInRequestSchema,
  VerifyAndLoginRequestSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordSuccessResponseSchema,
  VerifyResetCodeRequestSchema,
  VerifyResetCodeSuccessResponseSchema,
  ResetPasswordConfirmRequestSchema,
  ResetPasswordConfirmSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/ct_dashboard";

import { generateCustomerToken } from "@oko-wallet-ctd-api/auth";
import { sendEmailVerificationCode } from "@oko-wallet-ctd-api/email/send";
import {
  CHANGED_PASSWORD_MIN_LENGTH,
  CHANGED_PASSWORD_MAX_LENGTH,
  PASSWORD_CONTAINS_NUMBER_REGEX,
  EMAIL_REGEX,
  SIX_DIGITS_REGEX,
} from "@oko-wallet-ctd-api/constants";
import {
  customerJwtMiddleware,
  type CustomerAuthenticatedRequest,
} from "@oko-wallet-ctd-api/middleware/auth";
import { rateLimitMiddleware } from "@oko-wallet-ctd-api/middleware/rate_limit";
import { generateVerificationCode } from "@oko-wallet-ctd-api/email/verification";
import { sendPasswordResetEmail } from "@oko-wallet-ctd-api/email/password_reset";
import { createEmailVerification } from "@oko-wallet/oko-pg-interface/email_verifications";

registry.registerPath({
  method: "post",
  path: "/customer_dashboard/v1/customer/auth/forgot-password",
  tags: ["Customer Dashboard"],
  summary: "Request password reset",
  description: "Sends a password reset verification code to the email",
  security: [],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ForgotPasswordRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Reset code sent successfully",
      content: {
        "application/json": {
          schema: ForgotPasswordSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Account not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    429: {
      description: "Too many requests",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export async function forgotPassword(
  req: Request,
  res: Response<OkoApiResponse<{ message: string }>>,
) {
  try {
    const state = req.app.locals as any;
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        code: "CUSTOMER_ACCOUNT_NOT_FOUND",
        msg: "email is required",
      });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({
        success: false,
        code: "INVALID_EMAIL_OR_PASSWORD",
        msg: "Invalid email format",
      });
      return;
    }

    // Check if account exists
    const customerAccountResult = await getCTDUserWithCustomerByEmail(
      state.db,
      email,
    );

    if (!customerAccountResult.success) {
      res.status(500).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: "Failed to check account",
      });
      return;
    }

    if (customerAccountResult.data === null) {
      res.status(404).json({
        success: false,
        code: "CUSTOMER_ACCOUNT_NOT_FOUND",
        msg: "Account not found",
      });
      return;
    }

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + state.email_verification_expiration_minutes,
    );

    const createRes = await createEmailVerification(state.db, {
      email,
      verification_code: verificationCode,
      expires_at: expiresAt,
    });

    if (!createRes.success) {
      res.status(500).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: "Failed to create verification",
      });
      return;
    }

    const emailRes = await sendPasswordResetEmail(
      email,
      verificationCode,
      customerAccountResult.data.label,
      state.from_email,
      state.email_verification_expiration_minutes,
      {
        smtp_host: state.smtp_host,
        smtp_port: state.smtp_port,
        smtp_user: state.smtp_user,
        smtp_pass: state.smtp_pass,
      },
    );

    if (!emailRes.success) {
      res.status(500).json({
        success: false,
        code: "FAILED_TO_SEND_EMAIL",
        msg: "Failed to send email",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Reset code sent successfully",
      },
    });
  } catch (error) {
    console.error("Forgot password route error:", error);
    res.status(500).json({
      success: false,
      code: "UNKNOWN_ERROR",
      msg: "Internal server error",
    });
  }
}
