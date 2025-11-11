import express from "express";
import type { Response, Router } from "express";
import type {
  CreateCustomerResponse,
  CreateCustomerWithDashboardUserRequest,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  Customer,
  CustomerWithAPIKeys,
  DeleteCustomerAndCustomerDashboardUsersRequest,
  DeleteCustomerAndCustomerDashboardUsersResponse,
} from "@oko-wallet/oko-types/customers";
import multer from "multer";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  ErrorResponseSchema,
  AdminAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  CreateCustomerWithDashboardUserRequestSchema,
  CreateCustomerSuccessResponseSchema,
  GetCustomerListQuerySchema,
  GetCustomerListSuccessResponseSchema,
  CustomerIdParamSchema,
  GetCustomerSuccessResponseSchema,
  DeleteCustomerSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import {
  adminAuthMiddleware,
  type AuthenticatedAdminRequest,
} from "@oko-wallet-admin-api/middleware";
import {
  createCustomer,
  getCustomerList,
  getCustomerById,
  deleteCustomerAndUsers,
} from "@oko-wallet-admin-api/api/customer";

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
