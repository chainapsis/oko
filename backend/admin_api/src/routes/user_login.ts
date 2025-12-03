import type { Response, Request } from "express";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { login } from "@oko-wallet-admin-api/api/user";

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
