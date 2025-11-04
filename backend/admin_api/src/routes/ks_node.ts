import type { Response, Router } from "express";
import type { EwalletApiResponse } from "@oko-wallet/ewallet-types/api_response";
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
} from "@oko-wallet/ewallet-types/admin";
import type { CreateKSNodeRequest } from "@oko-wallet/ewallet-types/admin";
import { ErrorCodeMap } from "@oko-wallet/ewallet-api-error-codes";

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

export function setKSNodeRoutes(router: Router) {
  router.post(
    "/ks_node/get_all_ks_nodes",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest,
      res: Response<EwalletApiResponse<GetAllKSNodeResponse>>,
    ) => {
      const state = req.app.locals;

      const result = await getAllKSNodes(state.db);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );

  router.post(
    "/ks_node/get_ks_node_by_id",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<GetKSNodeByIdRequest>,
      res: Response<EwalletApiResponse<GetKSNodeByIdResponse>>,
    ) => {
      const state = req.app.locals;
      const result = await getKSNodeById(state.db, req.body);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );

  router.post(
    "/ks_node/create_ks_node",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<CreateKSNodeRequest>,
      res: Response<EwalletApiResponse<CreateKSNodeResponse>>,
    ) => {
      const state = req.app.locals;

      const result = await createKSNode(state.db, req.body);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );

  router.post(
    "/ks_node/deactivate_ks_node",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<DeactivateKSNodeRequest>,
      res: Response<EwalletApiResponse<DeactivateKSNodeResponse>>,
    ) => {
      const state = req.app.locals;

      const result = await deactivateKSNode(state.db, req.body);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );

  router.post(
    "/ks_node/delete_ks_node",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<DeactivateKSNodeRequest>,
      res: Response<EwalletApiResponse<DeactivateKSNodeResponse>>,
    ) => {
      const state = req.app.locals;

      const result = await deleteKSNode(state.db, req.body);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );

  router.post(
    "/ks_node/update_ks_node",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<UpdateKSNodeRequest>,
      res: Response<EwalletApiResponse<UpdateKSNodeResponse>>,
    ) => {
      const state = req.app.locals;

      const result = await updateKSNode(state.db, req.body);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );

  router.post(
    "/ks_node/activate_ks_node",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<ActivateKSNodeRequest>,
      res: Response<EwalletApiResponse<ActivateKSNodeResponse>>,
    ) => {
      const state = req.app.locals;

      const result = await activateKSNode(state.db, req.body);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );
}
