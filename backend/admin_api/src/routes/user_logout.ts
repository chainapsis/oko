import type { Response } from "express";
import type { AdminLogoutResponse } from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { logout } from "@oko-wallet-admin-api/api/user";

export async function user_logout(
  req: AuthenticatedAdminRequest,
  res: Response<OkoApiResponse<AdminLogoutResponse>>,
) {
  const state = req.app.locals;

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : undefined;

  const result = await logout(state.db, token);
  if (result.success === false) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
