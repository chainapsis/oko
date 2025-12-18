import type { Response, Router } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  ErrorResponseSchema,
  UserAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { registry } from "@oko-wallet/oko-api-openapi";
import { z } from "zod";

import {
  runSignEd25519Round1,
  runSignEd25519Round2,
  type SignEd25519Round1Body,
  type SignEd25519Round1Response,
  type SignEd25519Round2Body,
  type SignEd25519Round2Response,
} from "@oko-wallet-tss-api/api/sign_ed25519";
import {
  type UserAuthenticatedRequest,
  userJwtMiddleware,
  sendResponseWithNewToken,
} from "@oko-wallet-tss-api/middleware/keplr_auth";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";

// Schemas for OpenAPI documentation
const TeddsaCommitmentEntrySchema = z.object({
  identifier: z.array(z.number()).describe("Participant identifier bytes"),
  commitments: z.array(z.number()).describe("Serialized commitments bytes"),
});

const TeddsaSignatureShareEntrySchema = z.object({
  identifier: z.array(z.number()).describe("Participant identifier bytes"),
  signature_share: z
    .array(z.number())
    .describe("Serialized signature share bytes"),
});

const SignEd25519Round1RequestSchema = z.object({
  message: z.array(z.number()).describe("Message to sign as byte array"),
  client_commitment: TeddsaCommitmentEntrySchema.describe(
    "Client's commitment from round 1",
  ),
});

const SignEd25519Round1ResponseSchema = z.object({
  server_commitment: TeddsaCommitmentEntrySchema.describe(
    "Server's commitment",
  ),
  server_nonces: z
    .array(z.number())
    .describe("Server's nonces (return in round 2)"),
});

const SignEd25519Round2RequestSchema = z.object({
  message: z.array(z.number()).describe("Message that was signed"),
  client_signature_share: TeddsaSignatureShareEntrySchema.describe(
    "Client's signature share",
  ),
  all_commitments: z
    .array(TeddsaCommitmentEntrySchema)
    .describe("All commitments from both participants"),
  server_nonces: z
    .array(z.number())
    .describe("Server's nonces from round 1"),
});

const SignEd25519Round2ResponseSchema = z.object({
  server_signature_share: TeddsaSignatureShareEntrySchema.describe(
    "Server's signature share",
  ),
});

export function setSignEd25519Routes(router: Router) {
  // Round 1: Generate commitments
  registry.registerPath({
    method: "post",
    path: "/tss/v1/sign_ed25519/round1",
    tags: ["TSS"],
    summary: "TEdDSA Sign Round 1 - Generate commitments",
    description:
      "Server generates its signing commitments. Returns nonces that must be sent back in round 2.",
    security: [{ userAuth: [] }],
    request: {
      headers: UserAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: SignEd25519Round1RequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully generated server commitment",
        content: {
          "application/json": {
            schema: SignEd25519Round1ResponseSchema,
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
        description: "Unauthorized - Invalid or missing JWT token",
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
    "/sign_ed25519/round1",
    [userJwtMiddleware, tssActivateMiddleware],
    async (
      req: UserAuthenticatedRequest<SignEd25519Round1Body>,
      res: Response<OkoApiResponse<SignEd25519Round1Response>>,
    ) => {
      const state = req.app.locals as any;
      const user = res.locals.user;
      const body = req.body;

      const result = await runSignEd25519Round1(state.db, state.encryption_secret, {
        email: user.email.toLowerCase(),
        wallet_id: user.wallet_id,
        message: body.message,
        client_commitment: body.client_commitment,
      });

      if (result.success === false) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      sendResponseWithNewToken(res, result.data);
    },
  );

  // Round 2: Generate signature shares
  registry.registerPath({
    method: "post",
    path: "/tss/v1/sign_ed25519/round2",
    tags: ["TSS"],
    summary: "TEdDSA Sign Round 2 - Generate signature share",
    description:
      "Server generates its signature share. Client can then aggregate both shares into final signature.",
    security: [{ userAuth: [] }],
    request: {
      headers: UserAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: SignEd25519Round2RequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully generated server signature share",
        content: {
          "application/json": {
            schema: SignEd25519Round2ResponseSchema,
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
        description: "Unauthorized - Invalid or missing JWT token",
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
    "/sign_ed25519/round2",
    [userJwtMiddleware, tssActivateMiddleware],
    async (
      req: UserAuthenticatedRequest<SignEd25519Round2Body>,
      res: Response<OkoApiResponse<SignEd25519Round2Response>>,
    ) => {
      const state = req.app.locals as any;
      const user = res.locals.user;
      const body = req.body;

      const result = await runSignEd25519Round2(state.db, state.encryption_secret, {
        email: user.email.toLowerCase(),
        wallet_id: user.wallet_id,
        message: body.message,
        client_signature_share: body.client_signature_share,
        all_commitments: body.all_commitments,
        server_nonces: body.server_nonces,
      });

      if (result.success === false) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      sendResponseWithNewToken(res, result.data);
    },
  );
}
