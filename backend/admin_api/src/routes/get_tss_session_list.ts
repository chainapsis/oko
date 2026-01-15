import type { Response } from "express";

import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { getTssSessionList } from "@oko-wallet-admin-api/api/tss";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import type {
  GetTssSessionListRequest,
  GetTssSessionListResponse,
} from "@oko-wallet-types/admin";

export async function get_tss_session_list(
  req: AuthenticatedAdminRequest<GetTssSessionListRequest>,
  res: Response<OkoApiResponse<GetTssSessionListResponse>>,
) {
  const state = req.app.locals as any;

  const result = await getTssSessionList(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
