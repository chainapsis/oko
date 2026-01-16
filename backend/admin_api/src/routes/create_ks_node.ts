import { registry } from "@oko-wallet/oko-api-openapi";
import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { CreateKSNodeResponse } from "@oko-wallet/oko-types/admin";
import type { CreateKSNodeRequest } from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { createKSNode } from "@oko-wallet-admin-api/api/ks_node";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  CreateKSNodeRequestSchema,
  CreateKSNodeSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

registry.registerPath({
  method: "post",
  path: "/oko_admin/v1/ks_node/create_ks_node",
  tags: ["Admin"],
  summary: "Create key share node",
  description: "Creates a new key share node",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: CreateKSNodeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Key share node created successfully",
      content: {
        "application/json": {
          schema: CreateKSNodeSuccessResponseSchema,
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
