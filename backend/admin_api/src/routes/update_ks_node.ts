import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  UpdateKSNodeRequest,
  UpdateKSNodeResponse,
} from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { updateKSNode } from "@oko-wallet-admin-api/api/ks_node";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  UpdateKSNodeRequestSchema,
  UpdateKSNodeSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

registry.registerPath({
  method: "post",
  path: "/oko_admin/v1/ks_node/update_ks_node",
  tags: ["Admin"],
  summary: "Update key share node",
  description: "Updates a key share node server URL",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: UpdateKSNodeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Key share node updated successfully",
      content: {
        "application/json": {
          schema: UpdateKSNodeSuccessResponseSchema,
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

export async function update_ks_node(
  req: AuthenticatedAdminRequest<UpdateKSNodeRequest>,
  res: Response<OkoApiResponse<UpdateKSNodeResponse>>,
) {
  const state = req.app.locals;

  const result = await updateKSNode(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
