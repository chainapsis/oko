import type { Response, Router } from "express";
import type {
  CreateCustomerResponse,
  CreateCustomerWithDashboardUserRequest,
} from "@oko-wallet/ewallet-types/admin";
import type { EwalletApiResponse } from "@oko-wallet/ewallet-types/api_response";
import type {
  Customer,
  CustomerWithAPIKeys,
  DeleteCustomerAndCustomerDashboardUsersRequest,
  DeleteCustomerAndCustomerDashboardUsersResponse,
} from "@oko-wallet/ewallet-types/customers";
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

const upload = multer();

export function setCustomerRoutes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/ewallet_admin/v1/customer/create_customer",
    tags: ["Admin"],
    summary: "Create new customer",
    description: "Creates a new customer with dashboard user account",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        content: {
          "multipart/form-data": {
            schema: CreateCustomerWithDashboardUserRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Customer created successfully",
        content: {
          "application/json": {
            schema: CreateCustomerSuccessResponseSchema,
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
  router.post(
    "/customer/create_customer",
    adminAuthMiddleware,
    upload.single("logo"),
    async (
      req: AuthenticatedAdminRequest<CreateCustomerWithDashboardUserRequest> & {
        file?: Express.Multer.File;
      },
      res: Response<EwalletApiResponse<CreateCustomerResponse>>,
    ) => {
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
    },
  );

  registry.registerPath({
    method: "get",
    path: "/ewallet_admin/v1/customer/get_customer_list",
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
  router.get(
    "/customer/get_customer_list",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest,
      res: Response<
        EwalletApiResponse<{
          customerWithAPIKeysList: CustomerWithAPIKeys[];
          pagination: {
            total: number;
            current_page: number;
            total_pages: number;
          };
        }>
      >,
    ) => {
      const state = req.app.locals;

      let { limit, offset } = req.query;
      if (!limit || !offset) {
        limit = 10;
        offset = 0;
      } else {
        limit = parseInt(limit);
        offset = parseInt(offset);
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
    },
  );

  registry.registerPath({
    method: "get",
    path: "/ewallet_admin/v1/customer/get_customer/{customer_id}",
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
  router.get(
    "/customer/get_customer/:customer_id",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest,
      res: Response<EwalletApiResponse<Customer>>,
    ) => {
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
    },
  );

  registry.registerPath({
    method: "post",
    path: "/ewallet_admin/v1/customer/delete_customer/{customer_id}",
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
  router.post(
    "/customer/delete_customer/:customer_id",
    adminAuthMiddleware,
    async (
      req: AuthenticatedAdminRequest<DeleteCustomerAndCustomerDashboardUsersRequest>,
      res: Response<
        EwalletApiResponse<DeleteCustomerAndCustomerDashboardUsersResponse>
      >,
    ) => {
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
    },
  );
}
