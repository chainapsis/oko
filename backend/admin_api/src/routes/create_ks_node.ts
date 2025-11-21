import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { CreateKSNodeResponse } from "@oko-wallet/oko-types/admin";
import type { CreateKSNodeRequest } from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { createKSNode } from "@oko-wallet-admin-api/api/ks_node";

export async function create_ks_node(
  req: AuthenticatedAdminRequest<CreateKSNodeRequest>,
  res: Response<OkoApiResponse<CreateKSNodeResponse>>,
) {
  const state = req.app.locals;

  const result = await createKSNode(state.db, req.body, req.auditContext);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
