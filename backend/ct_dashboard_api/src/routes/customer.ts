import { Router, type Response } from "express";
import multer from "multer";
import type {
  Customer,
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
      res: Response<OkoApiResponse<Customer>>,
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
      res: Response<OkoApiResponse<APIKey[]>>,
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

  // Multer middleware for file upload
  const upload = multer();

  // OpenAPI registration for update_info endpoint
  registry.registerPath({
    method: "post",
    path: "/customer_dashboard/v1/customer/update_info",
    tags: ["Customer Dashboard"],
    summary: "Update customer information",
    description: "Updates customer label and/or logo. Logo is uploaded to S3.",
    security: [{ customerAuth: [] }],
    request: {
      headers: CustomerAuthHeaderSchema,
      body: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                label: {
                  type: "string",
                  description: "Customer/Team name",
                },
                logo: {
                  type: "string",
                  format: "binary",
                  description: "Logo image file (128×128 px, under 1 MB, no SVG)",
                },
                delete_logo: {
                  type: "string",
                  enum: ["true"],
                  description: "Set to 'true' to delete existing logo",
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Customer information updated successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid input",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
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
    "/customer/update_info",
    customerJwtMiddleware,
    upload.single("logo"),
    async (
      req: CustomerAuthenticatedRequest<UpdateCustomerInfoRequest> & {
        file?: Express.Multer.File;
      },
      res: Response<OkoApiResponse<UpdateCustomerInfoResponse>>,
    ) => {
      try {
        const state = req.app.locals as any;
        const userId = res.locals.user_id;
        const { label, delete_logo } = req.body;

        // 1. Get customer by user_id
        const customerRes = await getCustomerByUserId(state.db, userId);

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

        // 2. Handle logo update/deletion
        let logo_url: string | null = null;
        let shouldUpdateLogo = false;

        // If delete_logo flag is set, mark for deletion
        if (delete_logo === "true") {
          logo_url = null;
          shouldUpdateLogo = true;
        }
        // Otherwise, upload new logo if file is provided
        else if (req.file) {
          const uploadRes = await uploadToS3({
            region: state.s3_region,
            accessKeyId: state.s3_access_key_id,
            secretAccessKey: state.s3_secret_access_key,
            bucket: state.s3_bucket,
            key: `logos/${Date.now().toString()}-${req.file.originalname}`,
            body: req.file.buffer,
            contentType: req.file.mimetype,
          });

          if (!uploadRes.success) {
            res.status(500).json({
              success: false,
              code: "IMAGE_UPLOAD_FAILED",
              msg: `Failed to upload logo: ${uploadRes.err}`,
            });
            return;
          }

          logo_url = decodeURIComponent(uploadRes.data);
          shouldUpdateLogo = true;
        }

        // 3. Build updates object
        const updates: { label?: string; logo_url?: string | null } = {};
        if (label !== undefined && label.trim() !== "") {
          updates.label = label;
        }
        if (shouldUpdateLogo) {
          updates.logo_url = logo_url;
        }

        // 4. Check if there are any updates
        if (Object.keys(updates).length === 0) {
          res.status(400).json({
            success: false,
            code: "INVALID_REQUEST",
            msg: "No updates provided",
          });
          return;
        }

        // 5. Update customer info in database
        const updateRes = await updateCustomerInfo(
          state.db,
          customerRes.data.customer_id,
          updates,
        );

        if (!updateRes.success) {
          res.status(500).json({
            success: false,
            code: "UNKNOWN_ERROR",
            msg: updateRes.err,
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: {
            message: "Customer information updated successfully",
          },
        });
        return;
      } catch (error) {
        console.error("Update customer info error:", error);
        res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: "Internal server error",
        });
        return;
      }
    },
  );
}
