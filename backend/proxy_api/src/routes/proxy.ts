import type { Response, Router, Request } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorResponseSchema } from "@oko-wallet/oko-api-openapi/common";
import { registry } from "@oko-wallet/oko-api-openapi";
import type {
  SocialLoginXBody,
  SocialLoginXResponse,
} from "@oko-wallet/oko-types/proxy";

export function setProxyRoutes(router: Router) {
  // registry.registerPath({
  //   method: "post",
  //   path: "/proxy/v1/social-login",
  //   tags: ["Proxy"],
  //   summary: "Social login proxy",
  //   description: "Proxy endpoint for social login",
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
    "/social-login/x",
    async (
      req: Request<any, any, SocialLoginXBody>,
      res: Response<OkoApiResponse<SocialLoginXResponse>>,
    ) => {
      const state = req.app.locals;
      const body = req.body;

      const socialLoginXCallbackUrl = state.social_login_x_callback_url;
      const xClientId = state.x_client_id;
      const xSocialLoginTokenUrl = state.x_social_login_token_url;

      if (
        xClientId.length === 0 ||
        socialLoginXCallbackUrl.length === 0 ||
        xSocialLoginTokenUrl.length === 0
      ) {
        res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: "X client ID or social login X callback URL is not set",
        });
        return;
      }

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
        client_id: xClientId,
        redirect_uri: socialLoginXCallbackUrl,
        code_verifier: body.code_verifier,
      });
      const response = await fetch(xSocialLoginTokenUrl, {
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
}
