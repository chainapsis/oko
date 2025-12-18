import type { Response, Router } from "express";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { SignInResponse } from "@oko-wallet/oko-types/user";
import { ErrorResponseSchema, OAuthHeaderSchema } from "@oko-wallet/oko-api-openapi/common";
import { SignInSuccessResponseSchema } from "@oko-wallet/oko-api-openapi/tss";
import { registry } from "@oko-wallet/oko-api-openapi";
import { z } from "zod";

import {
  runKeygenEd25519,
  type KeygenEd25519Body,
} from "@oko-wallet-tss-api/api/keygen_ed25519";
import {
  type OAuthAuthenticatedRequest,
  oauthMiddleware,
} from "@oko-wallet-tss-api/middleware/oauth";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";

// Schema for Ed25519 keygen request
const KeygenEd25519RequestSchema = z.object({
  keygen_2: z.object({
    key_package: z.string().describe("Serialized KeyPackage as hex string"),
    public_key_package: z
      .string()
      .describe("Serialized PublicKeyPackage as hex string"),
    public_key: z.string().describe("Ed25519 public key (32 bytes) as hex string"),
  }),
});

export function setKeygenEd25519Routes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/tss/v1/keygen_ed25519",
    tags: ["TSS"],
    summary: "Run keygen to generate Ed25519 TSS key pair",
    description:
      "Creates user and wallet entities with Ed25519 curve by mapping the received key share with the user's email",
    security: [{ oauthAuth: [] }],
    request: {
      headers: OAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: KeygenEd25519RequestSchema,
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
        description: "Unauthorized - Invalid or missing OAuth token",
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
    "/keygen_ed25519",
    [oauthMiddleware, tssActivateMiddleware],
    async (
      req: OAuthAuthenticatedRequest<KeygenEd25519Body>,
      res: Response<OkoApiResponse<SignInResponse>>,
    ) => {
      const state = req.app.locals;
      const oauthUser = res.locals.oauth_user;
      const body = req.body;

      if (!oauthUser?.email) {
        res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          msg: "User email not found",
        });
        return;
      }

      const jwtConfig = {
        secret: state.jwt_secret,
        expires_in: state.jwt_expires_in,
      };

      const runKeygenRes = await runKeygenEd25519(
        state.db,
        jwtConfig,
        {
          email: oauthUser.email.toLowerCase(),
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
