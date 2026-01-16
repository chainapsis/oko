import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type {
  ActivateKSNodeRequest,
  ActivateKSNodeResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { Response } from "express";
import { registry } from "@oko-wallet/oko-api-openapi";

import { activateKSNode } from "@oko-wallet-admin-api/api/ks_node";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  ActivateKSNodeRequestSchema,
  ActivateKSNodeSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

registry.registerPath({
  method: "post",
  path: "/oko_admin/v1/ks_node/activate_ks_node",
  tags: ["Admin"],
  summary: "Activate key share node",
  description: "Activates a key share node",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ActivateKSNodeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Key share node activated successfully",
      content: {
        "application/json": {
          schema: ActivateKSNodeSuccessResponseSchema,
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

export async function activate_ks_node(
  req: AuthenticatedAdminRequest<ActivateKSNodeRequest>,
  res: Response<OkoApiResponse<ActivateKSNodeResponse>>,
) {
  const state = req.app.locals;

  const result = await activateKSNode(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
