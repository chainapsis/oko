import type { Response } from "express";
import type {
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

import { runSignEd25519Aggregate } from "@oko-wallet-tss-api/api/sign_ed25519";
import {
  type UserAuthenticatedRequest,
  sendResponseWithNewToken,
} from "@oko-wallet-tss-api/middleware/keplr_auth";

registry.registerPath({
  method: "post",
  path: "/tss/v2/sign_ed25519/aggregate",
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

export async function signEd25519Aggregate(
  req: UserAuthenticatedRequest<SignEd25519AggregateBody>,
  res: Response<OkoApiResponse<SignEd25519AggregateResponse>>,
) {
  const state = req.app.locals as any;
  const user = res.locals.user;
  const body = req.body;

  const result = await runSignEd25519Aggregate(
    state.db,
    state.encryption_secret,
    {
      email: user.email,
      wallet_id: user.wallet_id_ed25519,
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
}
