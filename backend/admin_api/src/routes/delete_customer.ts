import { registry } from "@oko-wallet/oko-api-openapi";
import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  DeleteCustomerAndCustomerDashboardUsersRequest,
  DeleteCustomerAndCustomerDashboardUsersResponse,
} from "@oko-wallet/oko-types/customers";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { deleteCustomerAndUsers } from "@oko-wallet-admin-api/api/customer";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  CustomerIdParamSchema,
  DeleteCustomerSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

registry.registerPath({
  method: "post",
  path: "/oko_admin/v1/customer/delete_customer/{customer_id}",
  tags: ["Admin"],
  summary: "Delete customer by ID",
  description: "Deletes a customer by customer ID",
  security: [{ adminAuth: [] }],
  request: {
    headers: AdminAuthHeaderSchema,
    params: CustomerIdParamSchema,
  },
  responses: {
    200: {
      description: "Customer deleted successfully",
      content: {
        "application/json": {
          schema: DeleteCustomerSuccessResponseSchema,
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

export async function delete_customer(
  req: AuthenticatedAdminRequest<DeleteCustomerAndCustomerDashboardUsersRequest>,
  res: Response<
    OkoApiResponse<DeleteCustomerAndCustomerDashboardUsersResponse>
  >,
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

  const deleteCustomerAndUsersRes = await deleteCustomerAndUsers(
    state.db,
    customerId,
  );
  if (deleteCustomerAndUsersRes.success === false) {
    res
      .status(ErrorCodeMap[deleteCustomerAndUsersRes.code] ?? 500)
      .json(deleteCustomerAndUsersRes);
    return;
  }

  res.status(200).json({
    success: true,
    data: deleteCustomerAndUsersRes.data,
  });
  return;
}
