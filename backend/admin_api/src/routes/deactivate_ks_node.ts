import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  DeactivateKSNodeRequest,
  DeactivateKSNodeResponse,
} from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { deactivateKSNode } from "@oko-wallet-admin-api/api/ks_node";

export async function deactivate_ks_node(
  req: AuthenticatedAdminRequest<DeactivateKSNodeRequest>,
  res: Response<OkoApiResponse<DeactivateKSNodeResponse>>,
) {
  const state = req.app.locals;

  const result = await deactivateKSNode(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
