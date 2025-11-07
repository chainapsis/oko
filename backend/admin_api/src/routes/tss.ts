import type { Router, Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetTssSessionListRequest,
  GetTssSessionListResponse,
  GetTssAllActivationSettingResponse,
  SetTssAllActivationSettingRequest,
  SetTssAllActivationSettingResponse,
} from "@oko-wallet-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  GetTssSessionListRequestSchema,
  GetTssSessionListSuccessResponseSchema,
  GetTssAllActivationSettingSuccessResponseSchema,
  SetTssAllActivationSettingRequestSchema,
  SetTssAllActivationSettingSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import {
  adminAuthMiddleware,
  type AuthenticatedAdminRequest,
} from "@oko-wallet-admin-api/middleware";
import {
  getTssSessionList,
  getTssAllActivationSetting,
  setTssAllActivationSetting,
} from "@oko-wallet-admin-api/api/tss";

export function setTssRoutes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/tss/get_tss_session_list",
    tags: ["Admin"],
    summary: "Get tss sessions with pagination",
    description: "Retrieves a list of TSS sessions with next/prev pagination",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: false,
        content: {
          "application/json": {
            schema: GetTssSessionListRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "TSS sessions retrieved successfully",
        content: {
          "application/json": {
            schema: GetTssSessionListSuccessResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  router.post(
    "/tss/get_tss_session_list",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<GetTssSessionListRequest>,
      res: Response<OkoApiResponse<GetTssSessionListResponse>>,
    ) => {
      const state = req.app.locals as any;

      const result = await getTssSessionList(state.db, req.body);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/tss/get_tss_all_activation_setting",
    tags: ["Admin"],
    summary: "Get TSS activation setting",
    description: "Retrieves the current TSS activation setting",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
    },
    responses: {
      200: {
        description: "TSS activation setting retrieved successfully",
        content: {
          "application/json": {
            schema: GetTssAllActivationSettingSuccessResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  router.post(
    "/tss/get_tss_all_activation_setting",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest,
      res: Response<OkoApiResponse<GetTssAllActivationSettingResponse>>,
    ) => {
      const state = req.app.locals as any;

      const result = await getTssAllActivationSetting(state.db);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/tss/set_tss_all_activation_setting",
    tags: ["Admin"],
    summary: "Set TSS activation setting",
    description: "Enable or disable TSS functionality for all users",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: SetTssAllActivationSettingRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "TSS activation setting updated successfully",
        content: {
          "application/json": {
            schema: SetTssAllActivationSettingSuccessResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid request",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
  router.post(
    "/tss/set_tss_all_activation_setting",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<SetTssAllActivationSettingRequest>,
      res: Response<OkoApiResponse<SetTssAllActivationSettingResponse>>,
    ) => {
      const state = req.app.locals as any;

      const result = await setTssAllActivationSetting(state.db, req.body);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );
}
