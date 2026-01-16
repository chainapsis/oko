import { registry } from "@oko-wallet/oko-api-openapi";
import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetTssSessionListRequest,
  GetTssSessionListResponse,
} from "@oko-wallet-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  GetTssSessionListSuccessResponseSchema,
  GetTssAllActivationSettingSuccessResponseSchema,
  SetTssAllActivationSettingRequestSchema,
  SetTssAllActivationSettingSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import {
  CreateCustomerWithDashboardUserRequestSchema,
  CreateCustomerSuccessResponseSchema,
  GetCustomerListQuerySchema,
  GetCustomerListSuccessResponseSchema,
  CustomerIdParamSchema,
  GetCustomerSuccessResponseSchema,
  DeleteCustomerSuccessResponseSchema,
  ResendCustomerUserPasswordRequestSchema,
  ResendCustomerUserPasswordSuccessResponseSchema,
  GetTssSessionListRequestSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import {
  LoginRequestSchema,
  AdminLoginSuccessResponseSchema,
  AdminLogoutSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { getTssSessionList } from "@oko-wallet-admin-api/api/tss";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";

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

export async function get_tss_session_list(
  req: AuthenticatedAdminRequest<GetTssSessionListRequest>,
  res: Response<OkoApiResponse<GetTssSessionListResponse>>,
) {
  const state = req.app.locals as any;

  const result = await getTssSessionList(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
