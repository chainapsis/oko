import type { Response, Router, Request } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  SocialLoginXVerifyUserResponse,
  SocialLoginXBody,
  SocialLoginXResponse,
} from "@oko-wallet/oko-types/social_login";
import { registry } from "@oko-wallet/oko-api-openapi";
import { ErrorResponseSchema } from "@oko-wallet/oko-api-openapi/common";
import {
  SocialLoginXRequestSchema,
  SocialLoginXSuccessResponseSchema,
  SocialLoginXVerifyUserSuccessResponseSchema,
  XAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/social_login";

import { getXUserInfo } from "@oko-wallet-social-login-api/api/x";
import {
  X_CLIENT_ID,
  X_SOCIAL_LOGIN_TOKEN_URL,
} from "@oko-wallet-social-login-api/constants/x";
import { rateLimitMiddleware } from "@oko-wallet-social-login-api/middleware/rate_limit";

export function setSocialLoginRoutes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/social-login/v1/x/get-token",
    tags: ["Social Login"],
    summary: "Get X access token",
    description: "Exchange authorization code for an X access token",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: SocialLoginXRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully retrieved access token",
        content: {
          "application/json": {
            schema: SocialLoginXSuccessResponseSchema,
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
    "/x/get-token",
    rateLimitMiddleware({ windowSeconds: 60, maxRequests: 10 }),
    async (
      req: Request<any, any, SocialLoginXBody>,
      res: Response<OkoApiResponse<SocialLoginXResponse>>,
    ) => {
      const state = req.app.locals;
      const body = req.body;

      if (!body.code || !body.code_verifier || !body.redirect_uri) {
        res.status(400).json({
          success: false,
          code: "INVALID_REQUEST",
          msg: "Code, code_verifier, or redirect_uri is not set",
        });
        return;
      }

      const reqBody = new URLSearchParams({
        code: body.code,
        grant_type: "authorization_code",
        client_id: X_CLIENT_ID,
        redirect_uri: body.redirect_uri,
        code_verifier: body.code_verifier,
      });
      const response = await fetch(X_SOCIAL_LOGIN_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: reqBody,
      });

      if (response.status === 200) {
        res.status(200).json({
          success: true,
          data: await response.json(),
        });
        return;
      }

      res.status(response.status).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: await response.text(),
      });
    },
  );

  registry.registerPath({
    method: "get",
    path: "/social-login/v1/x/verify-user",
    tags: ["Social Login"],
    summary: "Verify X user",
    description: "Fetch X user profile using access token",
    request: {
      headers: XAuthHeaderSchema,
    },
    responses: {
      200: {
        description: "Successfully verified X user",
        content: {
          "application/json": {
            schema: SocialLoginXVerifyUserSuccessResponseSchema,
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
  router.get(
    "/x/verify-user",
    rateLimitMiddleware({ windowSeconds: 60, maxRequests: 10 }),
    async (
      req: Request<any, any, null>,
      res: Response<OkoApiResponse<SocialLoginXVerifyUserResponse>>,
    ) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({
          success: false,
          code: "INVALID_REQUEST",
          msg: "Missing or invalid Authorization header",
        });
        return;
      }

      const accessToken = authHeader.replace("Bearer ", "");

      if (!accessToken) {
        res.status(400).json({
          success: false,
          code: "INVALID_REQUEST",
          msg: "Access token is not set",
        });
        return;
      }

      const response = await getXUserInfo(accessToken);

      if (response.success) {
        res.status(200).json({
          success: true,
          data: response.data,
        });
        return;
      }

      res.status(response.err.status).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: response.err.text,
      });
    },
  );
}
