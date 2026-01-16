import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import { ErrorResponseSchema } from "@oko-wallet/oko-api-openapi/common";
import {
  AdminLoginSuccessResponseSchema,
  LoginRequestSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { Request, Response } from "express";

import { login } from "@oko-wallet-admin-api/api/user";

registry.registerPath({
  method: "post",
  path: "/oko_admin/v1/user/login",
  tags: ["Admin"],
  summary: "Admin login",
  description: "Authenticates an admin user",
  security: [],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: LoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully logged in",
      content: {
        "application/json": {
          schema: AdminLoginSuccessResponseSchema,
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
      description: "Invalid credentials",
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

export async function user_login(
  req: Request<any, any, AdminLoginRequest>,
  res: Response<OkoApiResponse<AdminLoginResponse>>,
) {
  const state = req.app.locals;

  const result = await login(state.db, req.body, {
    secret: state.jwt_secret,
    expires_in: state.jwt_expires_in,
  });

  if (result.success === false) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
