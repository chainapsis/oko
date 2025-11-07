import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetWalletListRequest,
  GetWalletListResponse,
} from "@oko-wallet-types/admin";
import type { Response, Router } from "express";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  GetWalletListRequestSchema,
  GetWalletListSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import {
  adminAuthMiddleware,
  type AuthenticatedAdminRequest,
} from "@oko-wallet-admin-api/middleware";
import { getWalletList } from "@oko-wallet-admin-api/api/ewallet_wallet";

export function setWalletRoutes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/ewallet_admin/v1/wallet/get_wallet_list",
    tags: ["Admin"],
    summary: "Get wallet list with pagination",
    description: "Retrieves a list of wallets with pagination",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: false,
        content: {
          "application/json": {
            schema: GetWalletListRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Wallet list retrieved successfully",
        content: {
          "application/json": {
            schema: GetWalletListSuccessResponseSchema,
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
    "/wallet/get_wallet_list",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<GetWalletListRequest>,
      res: Response<OkoApiResponse<GetWalletListResponse>>,
    ) => {
      const state = req.app.locals;

      const result = await getWalletList(state.db, req.body);
      if (!result.success) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );
}
