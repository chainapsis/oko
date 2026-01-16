import { Router, type Response } from "express";
import sharp from "sharp";
import { randomUUID } from "crypto";
import type {
  Customer,
  CustomerTheme,
  UpdateCustomerInfoRequest,
  UpdateCustomerInfoResponse,
} from "@oko-wallet/oko-types/customers";
import {
  getCustomerByUserId,
  updateCustomerInfo,
} from "@oko-wallet/oko-pg-interface/customers";
import { getAPIKeysByCustomerId } from "@oko-wallet/oko-pg-interface/api_keys";
import type { APIKey } from "@oko-wallet/oko-types/ct_dashboard";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorResponseSchema } from "@oko-wallet/oko-api-openapi/common";
import { registry } from "@oko-wallet/oko-api-openapi";
import { CustomerAuthHeaderSchema } from "@oko-wallet/oko-api-openapi/ct_dashboard";
import {
  GetCustomerApiKeysRequestSchema,
  GetCustomerApiKeysSuccessResponseSchema,
  GetCustomerInfoSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/ct_dashboard";
import { uploadToS3 } from "@oko-wallet/aws";

import {
  customerJwtMiddleware,
  type CustomerAuthenticatedRequest,
} from "@oko-wallet-ctd-api/middleware/auth";
import { rateLimitMiddleware } from "@oko-wallet-ctd-api/middleware/rate_limit";
import { customerLogoUploadMiddleware } from "@oko-wallet-ctd-api/middleware/multer";
import { getCustomerInfo } from "./v1/get_customer_info";
import { getCustomerApiKeys } from "./v1/get_customer_api_keys";
import { updateCustomerInfoRoute } from "./v1/update_customer_info";

export function setCustomerRoutes(router: Router) {
  router.post("/customer/info", customerJwtMiddleware, getCustomerInfo);

  router.post("/customer/api_keys", customerJwtMiddleware, getCustomerApiKeys);

  router.post(
    "/customer/update_info",
    rateLimitMiddleware({ windowSeconds: 10 * 60, maxRequests: 20 }),
    customerJwtMiddleware,
    customerLogoUploadMiddleware,
    updateCustomerInfoRoute,
  );
}
