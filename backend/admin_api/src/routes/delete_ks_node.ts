import type { Response, Router } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetAllKSNodeResponse,
  CreateKSNodeResponse,
  DeactivateKSNodeRequest,
  DeactivateKSNodeResponse,
  GetKSNodeByIdRequest,
  GetKSNodeByIdResponse,
  UpdateKSNodeRequest,
  UpdateKSNodeResponse,
  ActivateKSNodeRequest,
  ActivateKSNodeResponse,
} from "@oko-wallet/oko-types/admin";
import type { CreateKSNodeRequest } from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import {
  adminAuthMiddleware,
  type AuthenticatedAdminRequest,
} from "@oko-wallet-admin-api/middleware";
import {
  getAllKSNodes,
  createKSNode,
  deactivateKSNode,
  getKSNodeById,
  updateKSNode,
  activateKSNode,
  deleteKSNode,
} from "@oko-wallet-admin-api/api/ks_node";

export async function delete_ks_node(
  req: AuthenticatedAdminRequest<DeactivateKSNodeRequest>,
  res: Response<OkoApiResponse<DeactivateKSNodeResponse>>,
) {
  const state = req.app.locals;

  const result = await deleteKSNode(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
