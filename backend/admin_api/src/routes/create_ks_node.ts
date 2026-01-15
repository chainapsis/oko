import type { Response } from "express";

import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type {
  CreateKSNodeRequest,
  CreateKSNodeResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { createKSNode } from "@oko-wallet-admin-api/api/ks_node";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";

export async function create_ks_node(
  req: AuthenticatedAdminRequest<CreateKSNodeRequest>,
  res: Response<OkoApiResponse<CreateKSNodeResponse>>,
) {
  const state = req.app.locals;

  const result = await createKSNode(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
