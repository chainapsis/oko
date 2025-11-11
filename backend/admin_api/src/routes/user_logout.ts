import type { Router, Response, Request } from "express";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminLogoutResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  ErrorResponseSchema,
  AdminAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  LoginRequestSchema,
  AdminLoginSuccessResponseSchema,
  AdminLogoutSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import { adminAuthMiddleware } from "@oko-wallet-admin-api/middleware";
import { login, logout } from "@oko-wallet-admin-api/api/user";

export async function user_logout(
  req: Request,
  res: Response<OkoApiResponse<AdminLogoutResponse>>,
) {
  const state = req.app.locals;

  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : undefined;

  const result = await logout(state.db, token);
  if (result.success === false) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
