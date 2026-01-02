import express from "express";
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
  ResendCustomerUserPasswordRequestSchema,
  ResendCustomerUserPasswordSuccessResponseSchema,
  GetTssSessionListRequestSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import {
  LoginRequestSchema,
  AdminLoginSuccessResponseSchema,
  AdminLogoutSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import {
  ActivateKSNodeRequestSchema,
  ActivateKSNodeSuccessResponseSchema,
  CreateKSNodeRequestSchema,
  CreateKSNodeSuccessResponseSchema,
  DeactivateKSNodeRequestSchema,
  DeactivateKSNodeSuccessResponseSchema,
  DeleteKSNodeRequestSchema,
  DeleteKSNodeSuccessResponseSchema,
  GetAllKSNodeSuccessResponseSchema,
  GetKSNodeByIdRequestSchema,
  GetKSNodeByIdSuccessResponseSchema,
  GetKSNHealthChecksRequestSchema,
  GetKSNHealthChecksSuccessResponseSchema,
  TypeformSignatureHeaderSchema,
  TypeformWebhookRequestSchema,
  UpdateKSNodeRequestSchema,
  UpdateKSNodeSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";
import { customerLogoUploadMiddleware } from "@oko-wallet-admin-api/middleware/multer";

import { adminAuthMiddleware } from "@oko-wallet-admin-api/middleware/auth";
import { typeformWebhookMiddleware } from "../middleware/typeform_webhook";
import { create_customer } from "./create_customer";
import { get_customer_list } from "./get_customer_list";
import { get_customer } from "./get_customer";
import { delete_customer } from "./delete_customer";
import { resend_customer_user_password } from "./resend_customer_user_password";
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
import { create_customer_by_typeform } from "./create_customer_by_typeform";
import { get_ksn_health_checks } from "./get_ksn_health_checks";

export function makeOkoAdminRouter() {
  const router = express.Router();

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
    customerLogoUploadMiddleware,
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
    path: "/oko_admin/v1/customer/resend_customer_user_password",
    tags: ["Admin"],
    summary: "Resend customer user password",
    description:
      "Resends the initial password email to a customer dashboard user. Only available for unverified accounts.",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: ResendCustomerUserPasswordRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Password email sent successfully",
        content: {
          "application/json": {
            schema: ResendCustomerUserPasswordSuccessResponseSchema,
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
        description: "User not found",
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
    "/customer/resend_customer_user_password",
    adminAuthMiddleware,
    resend_customer_user_password,
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

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/ks_node/get_all_ks_nodes",
    tags: ["Admin"],
    summary: "Get all key share nodes",
    description: "Retrieves all key share nodes with health status",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
    },
    responses: {
      200: {
        description: "Key share nodes retrieved successfully",
        content: {
          "application/json": {
            schema: GetAllKSNodeSuccessResponseSchema,
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
    "/ks_node/get_all_ks_nodes",
    adminAuthMiddleware,
    get_all_ks_nodes,
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/ks_node/get_ks_node_by_id",
    tags: ["Admin"],
    summary: "Get key share node by ID",
    description: "Retrieves a key share node by identifier",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: GetKSNodeByIdRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Key share node retrieved successfully",
        content: {
          "application/json": {
            schema: GetKSNodeByIdSuccessResponseSchema,
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
        description: "Key share node not found",
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
    "/ks_node/get_ks_node_by_id",
    adminAuthMiddleware,
    get_ks_node_by_id,
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/ks_node/create_ks_node",
    tags: ["Admin"],
    summary: "Create key share node",
    description: "Creates a new key share node",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CreateKSNodeRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Key share node created successfully",
        content: {
          "application/json": {
            schema: CreateKSNodeSuccessResponseSchema,
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
  router.post("/ks_node/create_ks_node", adminAuthMiddleware, create_ks_node);

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/ks_node/deactivate_ks_node",
    tags: ["Admin"],
    summary: "Deactivate key share node",
    description: "Deactivates a key share node",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: DeactivateKSNodeRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Key share node deactivated successfully",
        content: {
          "application/json": {
            schema: DeactivateKSNodeSuccessResponseSchema,
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
    "/ks_node/deactivate_ks_node",
    adminAuthMiddleware,
    deactivate_ks_node,
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/ks_node/delete_ks_node",
    tags: ["Admin"],
    summary: "Delete key share node",
    description: "Deletes a key share node",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: DeleteKSNodeRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Key share node deleted successfully",
        content: {
          "application/json": {
            schema: DeleteKSNodeSuccessResponseSchema,
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
  router.post("/ks_node/delete_ks_node", adminAuthMiddleware, delete_ks_node);

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/ks_node/update_ks_node",
    tags: ["Admin"],
    summary: "Update key share node",
    description: "Updates a key share node server URL",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: UpdateKSNodeRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Key share node updated successfully",
        content: {
          "application/json": {
            schema: UpdateKSNodeSuccessResponseSchema,
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
  router.post("/ks_node/update_ks_node", adminAuthMiddleware, update_ks_node);

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/ks_node/activate_ks_node",
    tags: ["Admin"],
    summary: "Activate key share node",
    description: "Activates a key share node",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: ActivateKSNodeRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Key share node activated successfully",
        content: {
          "application/json": {
            schema: ActivateKSNodeSuccessResponseSchema,
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
    "/ks_node/activate_ks_node",
    adminAuthMiddleware,
    activate_ks_node,
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/ks_node/get_ksn_health_checks",
    tags: ["Admin"],
    summary: "Get KS node health checks",
    description: "Retrieves KS node health checks with pagination",
    security: [{ adminAuth: [] }],
    request: {
      headers: AdminAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: GetKSNHealthChecksRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Health checks retrieved successfully",
        content: {
          "application/json": {
            schema: GetKSNHealthChecksSuccessResponseSchema,
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
    "/ks_node/get_ksn_health_checks",
    adminAuthMiddleware,
    get_ksn_health_checks,
  );

  registry.registerPath({
    method: "post",
    path: "/oko_admin/v1/customer/create_customer_by_typeform",
    tags: ["Admin"],
    summary: "Create customer by Typeform",
    description: "Creates a customer from a Typeform webhook payload",
    request: {
      headers: TypeformSignatureHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: TypeformWebhookRequestSchema,
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
    "/customer/create_customer_by_typeform",
    typeformWebhookMiddleware,
    create_customer_by_typeform,
  );

  return router;
}
