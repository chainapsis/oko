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
  path: "/customer_dashboard/v1/customer/auth/verify-reset-code",
  tags: ["Customer Dashboard"],
  summary: "Verify reset code",
  description: "Verifies the password reset code without consuming it",
  security: [],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: VerifyResetCodeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Code verified successfully",
      content: {
        "application/json": {
          schema: VerifyResetCodeSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid code",
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

export async function verifyResetCode(
  req: Request,
  res: Response<OkoApiResponse<{ isValid: boolean }>>,
) {
  try {
    const state = req.app.locals as any;
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        msg: "Email and code are required",
      });
      return;
    }

    const result = await markCodeVerified(state.db, email, code, 5);
    if (!result.success) {
      res.status(400).json({
        success: false,
        code: "INVALID_VERIFICATION_CODE",
        msg: "Invalid or expired verification code",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { isValid: true },
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    res.status(500).json({
      success: false,
      code: "UNKNOWN_ERROR",
      msg: "Internal server error",
    });
  }
}
