import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetKSNodeByIdRequest,
  GetKSNodeByIdResponse,
} from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware";
import { getKSNodeById } from "@oko-wallet-admin-api/api/ks_node";

export async function get_ks_node_by_id(
  req: AuthenticatedAdminRequest<GetKSNodeByIdRequest>,
  res: Response<OkoApiResponse<GetKSNodeByIdResponse>>,
) {
  const state = req.app.locals;
  const result = await getKSNodeById(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
