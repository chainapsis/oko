import type { Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuditContext } from "@oko-wallet-admin-api/utils/audit";
import { login } from "@oko-wallet-admin-api/api/user";

export async function user_login(
  req: Request<any, any, AdminLoginRequest>,
  res: Response<OkoApiResponse<AdminLoginResponse>>,
) {
  const state = req.app.locals;

  // Create audit context for login route
  const auditContext: AuditContext = {
    db: state.db,
    adminUserId: undefined, // Not authenticated yet
    request: req,
    requestId: uuidv4(),
  };

  const result = await login(
    state.db,
    req.body,
    {
      secret: state.jwt_secret,
      expires_in: state.jwt_expires_in,
    },
    auditContext,
  );
  if (result.success === false) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
