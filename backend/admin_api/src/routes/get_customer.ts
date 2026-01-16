import { registry } from "@oko-wallet/oko-api-openapi";
import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { Customer } from "@oko-wallet/oko-types/customers";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  CustomerIdParamSchema,
  GetCustomerSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { getCustomerById } from "@oko-wallet-admin-api/api/customer";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";

registry.registerPath({
  method: "get",
  path: "/oko_admin/v1/customer/get_customer/{customer_id}",
  tags: ["Admin"],
  summary: "Get customer by ID",
  description: "Retrieves customer information by customer ID",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
    params: CustomerIdParamSchema,
  },
  responses: {
    200: {
      description: "Customer information retrieved successfully",
      content: {
        "application/json": {
          schema: GetCustomerSuccessResponseSchema,
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
      description: "Customer not found",
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

export async function get_customer(
  req: AuthenticatedAdminRequest,
  res: Response<OkoApiResponse<Customer>>,
) {
  const state = req.app.locals;
  const { customer_id: customerId } = req.params;

  if (!customerId) {
    res.status(400).json({
      success: false,
      code: "MISSING_CUSTOMER_ID",
      msg: "Customer ID is required",
    });
    return;
  }

  const getCustomerByIdRes = await getCustomerById(state.db, customerId);
  if (getCustomerByIdRes.success === false) {
    res
      .status(ErrorCodeMap[getCustomerByIdRes.code] ?? 500)
      .json(getCustomerByIdRes);
    return;
  }

  res.status(200).json({ success: true, data: getCustomerByIdRes.data });
  return;
}
