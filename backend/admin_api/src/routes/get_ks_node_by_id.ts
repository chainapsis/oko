import { registry } from "@oko-wallet/oko-api-openapi";
import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetKSNodeByIdRequest,
  GetKSNodeByIdResponse,
} from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { getKSNodeById } from "@oko-wallet-admin-api/api/ks_node";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  GetKSNodeByIdRequestSchema,
  GetKSNodeByIdSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

registry.registerPath({
  method: "post",
  path: "/oko_admin/v1/ks_node/get_ks_node_by_id",
  tags: ["Admin"],
  summary: "Get key share node by ID",
  description: "Retrieves a key share node by identifier",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: GetKSNodeByIdRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Key share node retrieved successfully",
      content: {
        "application/json": {
          schema: GetKSNodeByIdSuccessResponseSchema,
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
    404: {
      description: "Key share node not found",
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

export async function get_ks_node_by_id(
  req: AuthenticatedAdminRequest<GetKSNodeByIdRequest>,
  res: Response<OkoApiResponse<GetKSNodeByIdResponse>>,
) {
  const state = req.app.locals;
  const result = await getKSNodeById(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
