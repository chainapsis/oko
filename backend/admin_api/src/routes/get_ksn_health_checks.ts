import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  GetKSNHealthChecksRequestSchema,
  GetKSNHealthChecksSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import type {
  GetKSNHealthChecksRequest,
  GetKSNHealthChecksResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { Response } from "express";

import { getKSNHealthChecks } from "@oko-wallet-admin-api/api/ks_node";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";

registry.registerPath({
  method: "post",
  path: "/oko_admin/v1/ks_node/get_ksn_health_checks",
  tags: ["Admin"],
  summary: "Get KS node health checks",
  description: "Retrieves KS node health checks with pagination",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: GetKSNHealthChecksRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Health checks retrieved successfully",
      content: {
        "application/json": {
          schema: GetKSNHealthChecksSuccessResponseSchema,
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
export async function get_ksn_health_checks(
  req: AuthenticatedAdminRequest<GetKSNHealthChecksRequest>,
  res: Response<OkoApiResponse<GetKSNHealthChecksResponse>>,
) {
  const state = req.app.locals;

  const result = await getKSNHealthChecks(
    state.db,
    req.body.pageIndex,
    req.body.pageSize,
  );

  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
