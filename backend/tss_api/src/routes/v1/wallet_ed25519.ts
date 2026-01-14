import type { Response, Router } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  ErrorResponseSchema,
  OAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { registry } from "@oko-wallet/oko-api-openapi";

import {
  getWalletEd25519PublicInfo,
  type WalletEd25519PublicInfoResponse,
} from "@oko-wallet-tss-api/api/wallet_ed25519";
import {
  type OAuthAuthenticatedRequest,
  oauthMiddleware,
} from "@oko-wallet-tss-api/middleware/oauth";
import type { OAuthLocals } from "@oko-wallet-tss-api/middleware/types";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";

export function setWalletEd25519Routes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/tss/v1/wallet_ed25519/public_info",
    tags: ["TSS"],
    summary: "Get Ed25519 wallet public info for recovery",
    description:
      "Returns the public_key_package and identifier needed to reconstruct " +
      "the Ed25519 key_package from KS node shares.",
    security: [{ oauthAuth: [] }],
    request: {
      headers: OAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user_verifying_share: {
                  type: "array",
                  items: { type: "number" },
                  description: "P0's verifying_share (32 bytes)",
                },
              },
              required: ["user_verifying_share"],
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully retrieved Ed25519 public info",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    public_key: { type: "string" },
                    public_key_package: {
                      type: "array",
                      items: { type: "number" },
                    },
                    identifier: { type: "array", items: { type: "number" } },
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
      404: {
        description: "Wallet not found",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      500: {
        description: "Internal server error",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  router.post(
    "/wallet_ed25519/public_info",
    oauthMiddleware,
    tssActivateMiddleware,
    async (
      req: OAuthAuthenticatedRequest<{ user_verifying_share: number[] }>,
      res: Response<
        OkoApiResponse<WalletEd25519PublicInfoResponse>,
        OAuthLocals
      >,
    ) => {
      const state = req.app.locals;
      const oauthUser = res.locals.oauth_user;
      const body = req.body;

      const user_identifier = oauthUser?.user_identifier;
      if (!user_identifier) {
        res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          msg: "User identifier not found",
        });
        return;
      }

      const result = await getWalletEd25519PublicInfo(
        state.db,
        state.encryption_secret,
        {
          user_identifier,
          auth_type: oauthUser.type,
          user_verifying_share: body.user_verifying_share,
        },
      );

      if (result.success === false) {
        res.status(ErrorCodeMap[result.code] ?? 500).json(result);
        return;
      }

      res.status(200).json(result);
    },
  );
}
