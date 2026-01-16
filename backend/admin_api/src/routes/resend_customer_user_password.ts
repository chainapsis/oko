import { registry } from "@oko-wallet/oko-api-openapi";
import type { Response } from "express";
import type {
  ResendCustomerUserPasswordRequest,
  ResendCustomerUserPasswordResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  ResendCustomerUserPasswordRequestSchema,
  ResendCustomerUserPasswordSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { resendCustomerUserPassword } from "@oko-wallet-admin-api/api/customer";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";

registry.registerPath({
  method: "post",
  path: "/oko_admin/v1/customer/resend_customer_user_password",
  tags: ["Admin"],
  summary: "Resend customer user password",
  description:
    "Resends the initial password email to a customer dashboard user. Only available for unverified accounts.",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ResendCustomerUserPasswordRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Password email sent successfully",
      content: {
        "application/json": {
          schema: ResendCustomerUserPasswordSuccessResponseSchema,
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
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
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

export async function resend_customer_user_password(
  req: AuthenticatedAdminRequest<ResendCustomerUserPasswordRequest>,
  res: Response<OkoApiResponse<ResendCustomerUserPasswordResponse>>,
) {
  const state = req.app.locals;
  const { customer_id: customerId, email } = req.body;

  if (!customerId) {
    res.status(400).json({
      success: false,
      code: "MISSING_CUSTOMER_ID",
      msg: "Customer ID is required",
    });
    return;
  }

  if (!email) {
    res.status(400).json({
      success: false,
      code: "INVALID_REQUEST",
      msg: "Email is required",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      code: "INVALID_REQUEST",
      msg: "Invalid email format",
    });
    return;
  }

  const resendPasswordRes = await resendCustomerUserPassword(
    state.db,
    {
      customer_id: customerId,
      email,
    },
    {
      email: {
        fromEmail: state.from_email,
        smtpConfig: {
          smtp_host: state.smtp_host,
          smtp_port: state.smtp_port,
          smtp_user: state.smtp_user,
          smtp_pass: state.smtp_pass,
        },
      },
    },
  );

  if (resendPasswordRes.success === false) {
    res
      .status(ErrorCodeMap[resendPasswordRes.code] ?? 500)
      .json(resendPasswordRes);
    return;
  }

  res.status(200).json({
    success: true,
    data: resendPasswordRes.data,
  });
  return;
}
