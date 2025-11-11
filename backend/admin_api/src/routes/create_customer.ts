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

export async function create_customer(
  req: AuthenticatedAdminRequest<CreateCustomerWithDashboardUserRequest> & {
    file?: Express.Multer.File;
  },
  res: Response<OkoApiResponse<CreateCustomerResponse>>,
) {
  const body = req.body;
  const state = req.app.locals;

  if (!body || !body.email || !body.password || !body.label) {
    res.status(400).json({
      success: false,
      code: "INVALID_EMAIL_OR_PASSWORD",
      msg: "Email, password, and label are required",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    res.status(400).json({
      success: false,
      code: "INVALID_EMAIL_OR_PASSWORD",
      msg: "Invalid email format",
    });
    return;
  }

  const createCustomerRes = await createCustomer(state.db, body, {
    s3: {
      region: state.s3_region,
      accessKeyId: state.s3_access_key_id,
      secretAccessKey: state.s3_secret_access_key,
      bucket: state.s3_bucket,
    },
    logo: req.file
      ? { buffer: req.file.buffer, originalname: req.file.originalname }
      : null,
  });
  if (createCustomerRes.success === false) {
    res
      .status(ErrorCodeMap[createCustomerRes.code] ?? 500)
      .json(createCustomerRes);
    return;
  }

  res.status(201).json({
    success: true,
    data: createCustomerRes.data,
  });
  return;
}
