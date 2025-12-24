import type { Response, Router } from "express";
import type {
  PresignEd25519Body,
  PresignEd25519Response,
} from "@oko-wallet/oko-types/tss";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  ErrorResponseSchema,
  UserAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { registry } from "@oko-wallet/oko-api-openapi";

import { runPresignEd25519 } from "@oko-wallet-tss-api/api/presign_ed25519";
import {
  type UserAuthenticatedRequest,
  userJwtMiddleware,
  sendResponseWithNewToken,
} from "@oko-wallet-tss-api/middleware/keplr_auth";
import { apiKeyMiddleware } from "@oko-wallet-tss-api/middleware/api_key_auth";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";

export function setPresignEd25519Routes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/tss/v1/presign_ed25519",
    tags: ["TSS"],
    summary: "Generate Ed25519 presign (nonces and commitments)",
    description:
      "Pre-generate nonces and commitments for Ed25519 threshold signing. " +
      "This can be called before knowing the message to sign.",
    security: [{ userAuth: [] }],
    request: {
      headers: UserAuthHeaderSchema,
      body: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {},
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully generated presign",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    session_id: { type: "string" },
                    commitments_0: {
                      type: "object",
                      properties: {
                        identifier: { type: "array", items: { type: "number" } },
                        commitments: { type: "array", items: { type: "number" } },
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
    "/presign_ed25519",
    [apiKeyMiddleware, userJwtMiddleware, tssActivateMiddleware],
    async (
      req: UserAuthenticatedRequest<PresignEd25519Body>,
      res: Response<OkoApiResponse<PresignEd25519Response>>,
    ) => {
      const state = req.app.locals as any;
      const user = res.locals.user;
      const apiKey = res.locals.api_key;

      if (!user.wallet_id_ed25519) {
        res.status(400).json({
          success: false,
          code: "WALLET_NOT_FOUND",
          msg: "Ed25519 wallet not found. Please create one first.",
        });
        return;
      }

      const result = await runPresignEd25519(state.db, state.encryption_secret, {
        email: user.email.toLowerCase(),
        wallet_id: user.wallet_id_ed25519,
        customer_id: apiKey.customer_id,
      });

      if (result.success === false) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      sendResponseWithNewToken(res, result.data);
    },
  );
}
