import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { GetAllKSNodeResponse } from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware";
import { getAllKSNodes } from "@oko-wallet-admin-api/api/ks_node";

export async function get_all_ks_nodes(
  req: AuthenticatedAdminRequest,
  res: Response<OkoApiResponse<GetAllKSNodeResponse>>,
) {
  const state = req.app.locals;

  const result = await getAllKSNodes(state.db);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
