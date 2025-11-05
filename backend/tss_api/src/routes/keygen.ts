import type { Response, Router } from "express";
import type { KeygenBody } from "@oko-wallet/ewallet-types/tss";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type { EwalletApiResponse } from "@oko-wallet/ewallet-types/api_response";
import type { SignInResponse } from "@oko-wallet/ewallet-types/user";
import {
  ErrorResponseSchema,
  GoogleAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { SignInSuccessResponseSchema } from "@oko-wallet/oko-api-openapi/tss";
import { registry } from "@oko-wallet/oko-api-openapi";
import { KeygenRequestSchema } from "@oko-wallet/oko-api-openapi/tss";

import { runKeygen } from "@oko-wallet-tss-api/api/keygen";
import {
  type GoogleAuthenticatedRequest,
  googleAuthMiddleware,
} from "@oko-wallet-tss-api/middleware/google_auth";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";

export function setKeygenRoutes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/tss/v1/keygen",
    tags: ["TSS"],
    summary: "Run keygen to generate TSS key pair",
    description:
      "Creates user and wallet entities by mapping the received key share \
    with the user's email",
    security: [{ googleAuth: [] }],
    request: {
      headers: GoogleAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: KeygenRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully created user and wallet entities",
        content: {
          "application/json": {
            schema: SignInSuccessResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing Google OAuth token",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      409: {
        description:
          "Conflict - Email already exists or public key already in use",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
  router.post(
    "/keygen",
    [googleAuthMiddleware, tssActivateMiddleware],
    async (
      req: GoogleAuthenticatedRequest<KeygenBody>,
      res: Response<EwalletApiResponse<SignInResponse>>,
    ) => {
      const state = req.app.locals;
      const googleUser = res.locals.google_user;
      const body = req.body;

      const jwtConfig = {
        secret: state.jwt_secret,
        expires_in: state.jwt_expires_in,
      };

      const runKeygenRes = await runKeygen(
        state.db,
        jwtConfig,
        {
          email: googleUser.email.toLowerCase(),
          keygen_2: body.keygen_2,
        },
        state.encryption_secret,
      );

      if (runKeygenRes.success === false) {
        res.status(ErrorCodeMap[runKeygenRes.code] ?? 500).json(runKeygenRes);
        return;
      }

      res.status(200).json({
        success: true,
        data: runKeygenRes.data,
      });
      return;
    },
  );
}
