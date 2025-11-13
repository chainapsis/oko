import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetTssSessionListRequest,
  GetTssSessionListResponse,
} from "@oko-wallet-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware";
import { getTssSessionList } from "@oko-wallet-admin-api/api/tss";

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
