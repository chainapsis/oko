import type { Response, Router } from "express";
import type {
  KeygenBody,
  KeygenBodyV2,
  KeygenEd25519Body,
} from "@oko-wallet/oko-types/tss";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  SignInResponse,
  SignInResponseV2,
} from "@oko-wallet/oko-types/user";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import {
  ErrorResponseSchema,
  OAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  SignInSuccessResponseSchema,
  SignInSuccessResponseV2Schema,
} from "@oko-wallet/oko-api-openapi/tss";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  KeygenRequestSchema,
  KeygenRequestV2Schema,
  KeygenEd25519RequestSchema,
} from "@oko-wallet/oko-api-openapi/tss";

import {
  runKeygen,
  runKeygenV2,
  runKeygenEd25519,
} from "@oko-wallet-tss-api/api/keygen";
import {
  type OAuthAuthenticatedRequest,
  oauthMiddleware,
} from "@oko-wallet-tss-api/middleware/oauth";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";
import type { OAuthLocals } from "@oko-wallet-tss-api/middleware/types";

export function setKeygenRoutes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/tss/v1/keygen",
    tags: ["TSS"],
    summary: "Run keygen to generate TSS key pair",
    description:
      "Creates user and wallet entities by mapping the received key share \
    with the user's email",
    security: [{ oauthAuth: [] }],
    request: {
      headers: OAuthHeaderSchema,
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
    "/keygen",
    oauthMiddleware,
    tssActivateMiddleware,
    async (
      req: OAuthAuthenticatedRequest<KeygenBody>,
      res: Response<OkoApiResponse<SignInResponse>, OAuthLocals>,
    ) => {
      const state = req.app.locals;
      const oauthUser = res.locals.oauth_user;
      const auth_type = oauthUser.type as AuthType;
      const user_identifier = oauthUser.user_identifier;
      const body = req.body;

      if (!user_identifier) {
        res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          msg: "User identifier not found",
        });
        return;
      }

      const jwtConfig = {
        secret: state.jwt_secret,
        expires_in: state.jwt_expires_in,
      };

      const runKeygenRes = await runKeygen(
        state.db,
        jwtConfig,
        {
          auth_type,
          user_identifier,
          keygen_2: body.keygen_2,
          email: oauthUser.email,
          name: oauthUser.name,
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

  // V2: Combined keygen for both secp256k1 and ed25519
  registry.registerPath({
    method: "post",
    path: "/tss/v2/keygen",
    tags: ["TSS"],
    summary: "Run keygen to generate TSS key pairs for both curve types",
    description:
      "Creates user and wallet entities for both secp256k1 and ed25519 curve types \
    by mapping the received key shares with the user's identifier",
    security: [{ oauthAuth: [] }],
    request: {
      headers: OAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: KeygenRequestV2Schema,
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Successfully created user and wallet entities for both curve types",
        content: {
          "application/json": {
            schema: SignInSuccessResponseV2Schema,
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
    "/keygen/v2",
    oauthMiddleware,
    tssActivateMiddleware,
    async (
      req: OAuthAuthenticatedRequest<KeygenBodyV2>,
      res: Response<OkoApiResponse<SignInResponseV2>, OAuthLocals>,
    ) => {
      const state = req.app.locals;
      const oauthUser = res.locals.oauth_user;
      const auth_type = oauthUser.type as AuthType;
      const user_identifier = oauthUser.user_identifier;
      const body = req.body;

      if (!user_identifier) {
        res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          msg: "User identifier not found",
        });
        return;
      }

      const jwtConfig = {
        secret: state.jwt_secret,
        expires_in: state.jwt_expires_in,
      };

      const runKeygenRes = await runKeygenV2(
        state.db,
        jwtConfig,
        {
          auth_type,
          user_identifier,
          keygen_2_secp256k1: body.keygen_2_secp256k1,
          keygen_2_ed25519: body.keygen_2_ed25519,
          email: oauthUser.email,
          name: oauthUser.name,
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

  registry.registerPath({
    method: "post",
    path: "/tss/v1/keygen_ed25519",
    tags: ["TSS"],
    summary: "Run keygen to generate Ed25519 TSS key pair",
    description:
      "Creates Ed25519 wallet for existing user with secp256k1 wallet",
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
        description: "Successfully created Ed25519 wallet",
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
      404: {
        description: "Not Found - User not found or secp256k1 wallet not found",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      409: {
        description:
          "Conflict - Ed25519 wallet already exists or public key already in use",
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
    oauthMiddleware,
    tssActivateMiddleware,
    async (
      req: OAuthAuthenticatedRequest<KeygenEd25519Body>,
      res: Response<OkoApiResponse<SignInResponse>, OAuthLocals>,
    ) => {
      const state = req.app.locals;
      const oauthUser = res.locals.oauth_user;
      const auth_type = oauthUser.type as AuthType;
      const body = req.body;

      const user_identifier = oauthUser.user_identifier;

      if (!user_identifier) {
        res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          msg: "User identifier not found",
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
          auth_type,
          user_identifier,
          keygen_2: body.keygen_2,
          email: oauthUser.email,
          name: oauthUser.name,
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
