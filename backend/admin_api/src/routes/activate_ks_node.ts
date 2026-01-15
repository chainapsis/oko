import type { Response } from "express";

import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type {
  ActivateKSNodeRequest,
  ActivateKSNodeResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { activateKSNode } from "@oko-wallet-admin-api/api/ks_node";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";

export async function activate_ks_node(
  req: AuthenticatedAdminRequest<ActivateKSNodeRequest>,
  res: Response<OkoApiResponse<ActivateKSNodeResponse>>,
) {
  const state = req.app.locals;

  const result = await activateKSNode(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
