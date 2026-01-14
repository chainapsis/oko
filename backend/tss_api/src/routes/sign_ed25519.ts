import type { Response, Router } from "express";
import type {
  SignEd25519Round1Body,
  SignEd25519Round1Response,
  SignEd25519Round2Body,
  SignEd25519Round2Response,
  SignEd25519AggregateBody,
  SignEd25519AggregateResponse,
} from "@oko-wallet/oko-types/tss";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  ErrorResponseSchema,
  UserAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { registry } from "@oko-wallet/oko-api-openapi";

import {
  runSignEd25519Round1,
  runSignEd25519Round2,
  runSignEd25519Aggregate,
} from "@oko-wallet-tss-api/api/sign_ed25519";
import {
  type UserAuthenticatedRequest,
  userJwtMiddleware,
  sendResponseWithNewToken,
} from "@oko-wallet-tss-api/middleware/keplr_auth";
import { apiKeyMiddleware } from "@oko-wallet-tss-api/middleware/api_key_auth";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";

export function setSignEd25519Routes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/tss/v1/sign_ed25519/round1",
    tags: ["TSS"],
    summary: "Generate Ed25519 signing commitments (Round 1)",
    description:
      "Server generates nonces and returns commitments for threshold signing",
    security: [{ userAuth: [] }],
    request: {
      headers: UserAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                msg: { type: "array", items: { type: "number" } },
              },
              required: ["msg"],
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully generated commitments",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    commitments_0: {
                      type: "object",
                      properties: {
                        identifier: {
                          type: "array",
                          items: { type: "number" },
                        },
                        commitments: {
                          type: "array",
                          items: { type: "number" },
                        },
                      },
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
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  router.post(
    "/sign_ed25519/round1",
    [apiKeyMiddleware, userJwtMiddleware, tssActivateMiddleware],
    async (
      req: UserAuthenticatedRequest<SignEd25519Round1Body>,
      res: Response<OkoApiResponse<SignEd25519Round1Response>>,
    ) => {
      const state = req.app.locals as any;
      const user = res.locals.user;
      const apiKey = res.locals.api_key;
      const body = req.body;

      const result = await runSignEd25519Round1(
        state.db,
        state.encryption_secret,
        {
          email: user.email.toLowerCase(),
          wallet_id: user.wallet_id,
          customer_id: apiKey.customer_id,
          msg: body.msg,
        },
      );

      if (result.success === false) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      sendResponseWithNewToken(res, result.data);
    },
  );

  registry.registerPath({
    method: "post",
    path: "/tss/v1/sign_ed25519/round2",
    tags: ["TSS"],
    summary: "Generate Ed25519 signature share (Round 2)",
    description: "Server generates signature share using collected commitments",
    security: [{ userAuth: [] }],
    request: {
      headers: UserAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                session_id: { type: "string" },
                commitments_1: {
                  type: "object",
                  properties: {
                    identifier: { type: "array", items: { type: "number" } },
                    commitments: { type: "array", items: { type: "number" } },
                  },
                },
              },
              required: ["session_id", "commitments_1"],
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully generated signature share",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    signature_share_0: {
                      type: "object",
                      properties: {
                        identifier: {
                          type: "array",
                          items: { type: "number" },
                        },
                        signature_share: {
                          type: "array",
                          items: { type: "number" },
                        },
                      },
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
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: ErrorResponseSchema } },
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

      const result = await runSignEd25519Round2(
        state.db,
        state.encryption_secret,
        {
          email: user.email.toLowerCase(),
          wallet_id: user.wallet_id,
          session_id: body.session_id,
          commitments_1: body.commitments_1,
        },
      );

      if (result.success === false) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      sendResponseWithNewToken(res, result.data);
    },
  );

  // New presign-based sign endpoint
  registry.registerPath({
    method: "post",
    path: "/tss/v1/sign_ed25519",
    tags: ["TSS"],
    summary: "Sign with Ed25519 using presign session",
    description:
      "Generate signature share using a pre-generated presign session. " +
      "Requires calling presign_ed25519 first to get session_id and server commitments.",
    security: [{ userAuth: [] }],
    request: {
      headers: UserAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                session_id: { type: "string" },
                msg: { type: "array", items: { type: "number" } },
                commitments_1: {
                  type: "object",
                  properties: {
                    identifier: { type: "array", items: { type: "number" } },
                    commitments: { type: "array", items: { type: "number" } },
                  },
                },
              },
              required: ["session_id", "msg", "commitments_1"],
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully generated signature share",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    signature_share_0: {
                      type: "object",
                      properties: {
                        identifier: {
                          type: "array",
                          items: { type: "number" },
                        },
                        signature_share: {
                          type: "array",
                          items: { type: "number" },
                        },
                      },
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
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/tss/v1/sign_ed25519/aggregate",
    tags: ["TSS"],
    summary: "Aggregate Ed25519 signature shares",
    description: "Combine all signature shares into a final Ed25519 signature",
    security: [{ userAuth: [] }],
    request: {
      headers: UserAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                session_id: { type: "string", format: "uuid" },
                msg: { type: "array", items: { type: "number" } },
                all_commitments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      identifier: { type: "array", items: { type: "number" } },
                      commitments: { type: "array", items: { type: "number" } },
                    },
                  },
                },
                all_signature_shares: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      identifier: { type: "array", items: { type: "number" } },
                      signature_share: {
                        type: "array",
                        items: { type: "number" },
                      },
                    },
                  },
                },
                user_verifying_share: {
                  type: "array",
                  items: { type: "number" },
                  description: "P0's verifying_share (32 bytes)",
                },
              },
              required: [
                "session_id",
                "msg",
                "all_commitments",
                "all_signature_shares",
                "user_verifying_share",
              ],
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully aggregated signature",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    signature: { type: "array", items: { type: "number" } },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  router.post(
    "/sign_ed25519/aggregate",
    [userJwtMiddleware, tssActivateMiddleware],
    async (
      req: UserAuthenticatedRequest<SignEd25519AggregateBody>,
      res: Response<OkoApiResponse<SignEd25519AggregateResponse>>,
    ) => {
      const state = req.app.locals as any;
      const user = res.locals.user;
      const body = req.body;

      const result = await runSignEd25519Aggregate(
        state.db,
        state.encryption_secret,
        {
          email: user.email.toLowerCase(),
          wallet_id: user.wallet_id,
          session_id: body.session_id,
          msg: body.msg,
          all_commitments: body.all_commitments,
          all_signature_shares: body.all_signature_shares,
          user_verifying_share: body.user_verifying_share,
        },
      );

      if (result.success === false) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      sendResponseWithNewToken(res, result.data);
    },
  );
}
