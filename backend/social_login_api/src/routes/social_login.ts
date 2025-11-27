import type { Response, Router, Request } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  SocialLoginXVerifyUserResponse,
  SocialLoginXBody,
  SocialLoginXResponse,
} from "@oko-wallet/oko-types/social_login";
import { getXUserInfo } from "@oko-wallet-social-login-api/api/x";
import {
  SOCIAL_LOGIN_X_CALLBACK_URL,
  X_CLIENT_ID,
  X_SOCIAL_LOGIN_TOKEN_URL,
} from "@oko-wallet-social-login-api/constants/x";

export function setSocialLoginRoutes(router: Router) {
  // registry.registerPath({
  //   method: "post",
  //   path: "/social-login/v1/social-login",
  //   tags: ["Social Login"],
  //   summary: "Social login",
  //   description: "Endpoint for social login",
  //   security: [],
  //   request: {
  //     body: {
  //       required: false,
  //       content: {
  //         "application/json": {
  //           schema: {
  //             type: "object",
  //           },
  //         },
  //       },
  //     },
  //   },
  //   responses: {
  //     200: {
  //       description: "Success",
  //       content: {
  //         "application/json": {
  //           schema: {
  //             type: "object",
  //             properties: {
  //               success: { type: "boolean" },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     500: {
  //       description: "Server error",
  //       content: {
  //         "application/json": {
  //           schema: ErrorResponseSchema,
  //         },
  //       },
  //     },
  //   },
  // });
  router.post(
    "/x/get-token",
    async (
      req: Request<any, any, SocialLoginXBody>,
      res: Response<OkoApiResponse<SocialLoginXResponse>>,
    ) => {
      const state = req.app.locals;
      const body = req.body;

      if (!body.code || !body.code_verifier) {
        res.status(400).json({
          success: false,
          code: "INVALID_REQUEST",
          msg: "Code or code_verifier is not set",
        });
        return;
      }

      const reqBody = new URLSearchParams({
        code: body.code,
        grant_type: "authorization_code",
        client_id: X_CLIENT_ID,
        redirect_uri: SOCIAL_LOGIN_X_CALLBACK_URL,
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

  router.get(
    "/x/verify-user",
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

      const response = await fetch(X_USER_INFO_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        res.status(200).json({
          success: true,
          data: (await response.json()).data,
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
}
