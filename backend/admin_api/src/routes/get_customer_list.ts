import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  GetCustomerListQuerySchema,
  GetCustomerListSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { CustomerWithAPIKeys } from "@oko-wallet/oko-types/customers";
import type { Response } from "express";

import { getCustomerList } from "@oko-wallet-admin-api/api/customer";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";

registry.registerPath({
  method: "get",
  path: "/oko_admin/v1/customer/get_customer_list",
  tags: ["Admin"],
  summary: "Get customers with pagination",
  description: "Retrieves a list of customers with pagination",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
    query: GetCustomerListQuerySchema,
  },
  responses: {
    200: {
      description: "Customer list retrieved successfully",
      content: {
        "application/json": {
          schema: GetCustomerListSuccessResponseSchema,
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

export async function get_customer_list(
  req: AuthenticatedAdminRequest,
  res: Response<
    OkoApiResponse<{
      customerWithAPIKeysList: CustomerWithAPIKeys[];
      pagination: {
        total: number;
        current_page: number;
        total_pages: number;
        verified_count: number;
        tx_active_count: number;
      };
    }>
  >,
) {
  const state = req.app.locals;

  let { limit, offset } = req.query;
  if (!limit || !offset) {
    limit = 10;
    offset = 0;
  } else {
    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);
  }

  const getCustomerListRes = await getCustomerList(state.db, limit, offset);
  if (getCustomerListRes.success === false) {
    res
      .status(ErrorCodeMap[getCustomerListRes.code] ?? 500)
      .json(getCustomerListRes);
    return;
  }

  res.status(200).json({
    success: true,
    data: getCustomerListRes.data,
  });
  return;
}
