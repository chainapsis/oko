import type { Router, Response, Request } from "express";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminLogoutResponse,
} from "@oko-wallet/ewallet-types/admin";
import type { OkoApiResponse } from "@oko-wallet/ewallet-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  ErrorResponseSchema,
  AdminAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  LoginRequestSchema,
  AdminLoginSuccessResponseSchema,
  AdminLogoutSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import { adminAuthMiddleware } from "@oko-wallet-admin-api/middleware";
import { login, logout } from "@oko-wallet-admin-api/api/user";

export function setUserRoutes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/ewallet_admin/v1/user/login",
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
  router.post(
    "/user/login",
    async (
      req: Request<any, any, AdminLoginRequest>,
      res: Response<OkoApiResponse<AdminLoginResponse>>,
    ) => {
      const state = req.app.locals;

      const result = await login(state.db, req.body, {
        secret: state.jwt_secret,
        expires_in: state.jwt_expires_in,
      });
      if (result.success === false) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );

  registry.registerPath({
    method: "post",
    path: "/ewallet_admin/v1/user/logout",
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
  router.post(
    "/user/logout",
    adminAuthMiddleware,
    async (
      req: Request,
      res: Response<OkoApiResponse<AdminLogoutResponse>>,
    ) => {
      const state = req.app.locals;

      const authHeader = req.headers.authorization;
      const token =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.substring(7)
          : undefined;

      const result = await logout(state.db, token);
      if (result.success === false) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );
}
