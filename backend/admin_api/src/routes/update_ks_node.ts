import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  UpdateKSNodeRequest,
  UpdateKSNodeResponse,
} from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { updateKSNode } from "@oko-wallet-admin-api/api/ks_node";

export async function update_ks_node(
  req: AuthenticatedAdminRequest<UpdateKSNodeRequest>,
  res: Response<OkoApiResponse<UpdateKSNodeResponse>>,
) {
  const state = req.app.locals;

  const result = await updateKSNode(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
