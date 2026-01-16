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

registry.registerPath({
  method: "post",
  path: "/customer_dashboard/v1/customer/info",
  tags: ["Customer Dashboard"],
  summary: "Get customer information",
  description: "Retrieves customer information for the authenticated user",
  security: [{ customerAuth: [] }],
  request: {
    headers: CustomerAuthHeaderSchema,
  },
  responses: {
    200: {
      description: "Customer information retrieved successfully",
      content: {
        "application/json": {
          schema: GetCustomerInfoSuccessResponseSchema,
        },
      },
    },
    401: {
      description: "User not authenticated",
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

export async function getCustomerInfo(
  req: CustomerAuthenticatedRequest,
  res: Response<OkoApiResponse<Customer>>,
) {
  try {
    const state = req.app.locals as any;

    const customerRes = await getCustomerByUserId(state.db, res.locals.user_id);

    if (!customerRes.success) {
      res.status(500).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: customerRes.err,
      });
      return;
    }

    if (customerRes.data === null) {
      res.status(404).json({
        success: false,
        code: "CUSTOMER_NOT_FOUND",
        msg: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: customerRes.data,
    });
    return;
  } catch (error) {
    console.error("Get customer info error:", error);
    res.status(500).json({
      success: false,
      code: "UNKNOWN_ERROR",
      msg: "Internal server error",
    });
    return;
  }
}
