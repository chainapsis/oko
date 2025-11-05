import { Router, type Response } from "express";
import type { Customer } from "@oko-wallet/ewallet-types/customers";
import { getCustomerByUserId } from "@oko-wallet/oko-pg-interface/customers";
import { getAPIKeysByCustomerId } from "@oko-wallet/oko-pg-interface/api_keys";
import type { APIKey } from "@oko-wallet/ewallet-types/ct_dashboard";
import type { EwalletApiResponse } from "@oko-wallet/ewallet-types/api_response";
import { ErrorResponseSchema } from "@oko-wallet/oko-api-openapi/common";
import { registry } from "@oko-wallet/oko-api-openapi";
import { CustomerAuthHeaderSchema } from "@oko-wallet/oko-api-openapi/ct_dashboard";
import {
  GetCustomerApiKeysRequestSchema,
  GetCustomerApiKeysSuccessResponseSchema,
  GetCustomerInfoSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/ct_dashboard";

import {
  customerJwtMiddleware,
  type CustomerAuthenticatedRequest,
} from "@oko-wallet-ctd-api/middleware";

export function setCustomerRoutes(router: Router) {
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
  router.post(
    "/customer/info",
    customerJwtMiddleware,
    async (
      req: CustomerAuthenticatedRequest,
      res: Response<EwalletApiResponse<Customer>>,
    ) => {
      try {
        const state = req.app.locals as any;

        const customerRes = await getCustomerByUserId(
          state.db,
          res.locals.user_id,
        );

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
    },
  );

  registry.registerPath({
    method: "post",
    path: "/customer_dashboard/v1/customer/api_keys",
    tags: ["Customer Dashboard"],
    summary: "Get customer API keys",
    description: "Retrieves API keys for the specified customer",
    security: [{ customerAuth: [] }],
    request: {
      headers: CustomerAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: GetCustomerApiKeysRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "API keys retrieved successfully",
        content: {
          "application/json": {
            schema: GetCustomerApiKeysSuccessResponseSchema,
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
        description: "API keys not found",
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
  router.post(
    "/customer/api_keys",
    customerJwtMiddleware,
    async (
      req: CustomerAuthenticatedRequest<{ customer_id: string }>,
      res: Response<EwalletApiResponse<APIKey[]>>,
    ) => {
      try {
        const state = req.app.locals as any;

        const apiKeys = await getAPIKeysByCustomerId(
          state.db,
          req.body.customer_id,
        );

        if (!apiKeys.success) {
          res.status(500).json({
            success: false,
            code: "UNKNOWN_ERROR",
            msg: apiKeys.err,
          });
          return;
        }

        if (apiKeys.data.length === 0) {
          res.status(404).json({
            success: false,
            code: "API_KEYS_NOT_FOUND",
            msg: "No API keys found",
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: apiKeys.data,
        });
      } catch (error) {
        console.error("Get API keys error:", error);
        res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: "Internal server error",
        });
      }
    },
  );
}
