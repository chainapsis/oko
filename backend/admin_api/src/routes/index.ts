import express from "express";
import multer from "multer";
import {
  GetWalletListRequestSchema,
  GetWalletListSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  ErrorResponseSchema,
  AdminAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  GetTssSessionListSuccessResponseSchema,
  GetTssAllActivationSettingSuccessResponseSchema,
  SetTssAllActivationSettingRequestSchema,
  SetTssAllActivationSettingSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import {
  CreateCustomerWithDashboardUserRequestSchema,
  CreateCustomerSuccessResponseSchema,
  GetCustomerListQuerySchema,
  GetCustomerListSuccessResponseSchema,
  CustomerIdParamSchema,
  GetCustomerSuccessResponseSchema,
  DeleteCustomerSuccessResponseSchema,
  GetTssSessionListRequestSchema,
  GetAuditLogsQuerySchema,
  GetAuditLogsCountQuerySchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import {
  LoginRequestSchema,
  AdminLoginSuccessResponseSchema,
  AdminLogoutSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import { adminAuthMiddleware } from "@oko-wallet-admin-api/middleware";
import { create_customer } from "./create_customer";
import { get_customer_list } from "./get_customer_list";
import { get_customer } from "./get_customer";
import { delete_customer } from "./delete_customer";
import { user_login } from "./user_login";
import { user_logout } from "./user_logout";
import { get_tss_session_list } from "./get_tss_session_list";
import { get_tss_all_activation_setting } from "./get_tss_all_activation_setting";
import { set_tss_all_activation_setting } from "./set_tss_all_activation_setting";
import { get_wallet_list } from "./get_wallet_list";
import { get_all_ks_nodes } from "./get_all_ks_nodes";
import { get_ks_node_by_id } from "./get_ks_node_by_id";
import { create_ks_node } from "./create_ks_node";
import { deactivate_ks_node } from "./deactivate_ks_node";
import { delete_ks_node } from "./delete_ks_node";
import { update_ks_node } from "./update_ks_node";
import { activate_ks_node } from "./activate_ks_node";
import { get_audit_logs } from "./get_audit_logs";
import { get_audit_logs_count } from "./get_audit_logs_count";
import { get_ksn_health_checks } from "./get_ksn_health_checks";

export function makeEWalletAdminRouter() {
  const router = express.Router();
  const upload = multer();

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/customer/create_customer",
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
    create_customer,
  );

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
  router.get(
    "/customer/get_customer_list",
    adminAuthMiddleware,
    get_customer_list,
  );

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
  router.get(
    "/customer/get_customer/:customer_id",
    adminAuthMiddleware,
    get_customer,
  );

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
  router.post(
    "/customer/delete_customer/:customer_id",
    adminAuthMiddleware,
    delete_customer,
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/user/login",
    tags: ["Admin"],
    summary: "Admin login",
    description: "Authenticates an admin user",
    security: [],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: LoginRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully logged in",
        content: {
          "application/json": {
            schema: AdminLoginSuccessResponseSchema,
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
        description: "Invalid credentials",
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
  router.post("/user/login", user_login);

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/user/logout",
    tags: ["Admin"],
    summary: "Admin logout",
    description: "Logs out an admin user",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
    },
    responses: {
      200: {
        description: "Successfully logged out",
        content: {
          "application/json": {
            schema: AdminLogoutSuccessResponseSchema,
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
  router.post("/user/logout", adminAuthMiddleware, user_logout);

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/tss/get_tss_session_list",
    tags: ["Admin"],
    summary: "Get tss sessions with pagination",
    description: "Retrieves a list of TSS sessions with next/prev pagination",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: false,
        content: {
          "application/json": {
            schema: GetTssSessionListRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "TSS sessions retrieved successfully",
        content: {
          "application/json": {
            schema: GetTssSessionListSuccessResponseSchema,
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
    "/tss/get_tss_session_list",
    adminAuthMiddleware,
    get_tss_session_list,
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/tss/get_tss_all_activation_setting",
    tags: ["Admin"],
    summary: "Get TSS activation setting",
    description: "Retrieves the current TSS activation setting",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
    },
    responses: {
      200: {
        description: "TSS activation setting retrieved successfully",
        content: {
          "application/json": {
            schema: GetTssAllActivationSettingSuccessResponseSchema,
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
    "/tss/get_tss_all_activation_setting",
    adminAuthMiddleware,
    get_tss_all_activation_setting,
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/tss/set_tss_all_activation_setting",
    tags: ["Admin"],
    summary: "Set TSS activation setting",
    description: "Enable or disable TSS functionality for all users",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: SetTssAllActivationSettingRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "TSS activation setting updated successfully",
        content: {
          "application/json": {
            schema: SetTssAllActivationSettingSuccessResponseSchema,
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
    "/tss/set_tss_all_activation_setting",
    adminAuthMiddleware,
    set_tss_all_activation_setting,
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/wallet/get_wallet_list",
    tags: ["Admin"],
    summary: "Get wallet list with pagination",
    description: "Retrieves a list of wallets with pagination",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: false,
        content: {
          "application/json": {
            schema: GetWalletListRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Wallet list retrieved successfully",
        content: {
          "application/json": {
            schema: GetWalletListSuccessResponseSchema,
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
  router.post("/wallet/get_wallet_list", adminAuthMiddleware, get_wallet_list);

  router.post(
    "/ks_node/get_all_ks_nodes",
    adminAuthMiddleware,
    get_all_ks_nodes,
  );

  router.post(
    "/ks_node/get_ks_node_by_id",
    adminAuthMiddleware,
    get_ks_node_by_id,
  );

  router.post("/ks_node/create_ks_node", adminAuthMiddleware, create_ks_node);

  router.post(
    "/ks_node/deactivate_ks_node",
    adminAuthMiddleware,
    deactivate_ks_node,
  );

  router.post("/ks_node/delete_ks_node", adminAuthMiddleware, delete_ks_node);

  router.post("/ks_node/update_ks_node", adminAuthMiddleware, update_ks_node);

  router.post(
    "/ks_node/activate_ks_node",
    adminAuthMiddleware,
    activate_ks_node,
  );

  router.post(
    "/ks_node/get_ksn_health_checks",
    adminAuthMiddleware,
    get_ksn_health_checks,
  );

  registry.registerPath({
    method: "get",
    path: "/oko_admin/v1/audit/logs",
    tags: ["Admin"],
    summary: "Get audit logs",
    description: "Retrieves audit logs with filtering and pagination",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      query: GetAuditLogsQuerySchema,
    },
    responses: {
      200: {
        description: "Audit logs retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      occurred_at: { type: "string", format: "date-time" },
                      request_id: { type: "string" },
                      actor: { type: "string" },
                      actor_ip: { type: "string" },
                      user_agent: { type: "string" },
                      source: { type: "string" },
                      action: { type: "string" },
                      target_type: { type: "string" },
                      target_id: { type: "string" },
                      changes: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string" },
                            from: {},
                            to: {},
                          },
                        },
                      },
                      params: { type: "object" },
                      outcome: {
                        type: "string",
                        enum: ["success", "failure", "denied"],
                      },
                      error: { type: "string" },
                    },
                  },
                },
              },
            },
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
  router.get("/audit/logs", adminAuthMiddleware, get_audit_logs);

  registry.registerPath({
    method: "get",
    path: "/oko_admin/v1/audit/logs/count",
    tags: ["Admin"],
    summary: "Get audit logs count",
    description: "Retrieves count of audit logs matching filters",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      query: GetAuditLogsCountQuerySchema,
    },
    responses: {
      200: {
        description: "Audit logs count retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { type: "integer" },
              },
            },
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
  router.get("/audit/logs/count", adminAuthMiddleware, get_audit_logs_count);

  return router;
}
