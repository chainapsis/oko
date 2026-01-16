import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { GetAllKSNodeSuccessResponseSchema } from "@oko-wallet/oko-api-openapi/oko_admin";
import type { GetAllKSNodeResponse } from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { Response } from "express";

import { getAllKSNodes } from "@oko-wallet-admin-api/api/ks_node";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";

registry.registerPath({
  method: "post",
  path: "/oko_admin/v1/ks_node/get_all_ks_nodes",
  tags: ["Admin"],
  summary: "Get all key share nodes",
  description: "Retrieves all key share nodes with health status",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
  },
  responses: {
    200: {
      description: "Key share nodes retrieved successfully",
      content: {
        "application/json": {
          schema: GetAllKSNodeSuccessResponseSchema,
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
