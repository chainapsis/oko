import type { Response, Router, Request } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import {
  ErrorResponseSchema,
  UserAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  SaveReferralRequestSchema,
  SaveReferralSuccessResponseSchema,
  GetReferralQuerySchema,
  GetReferralSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/social_login";
import { Bytes } from "@oko-wallet/bytes";
import {
  createReferral,
  getReferralsByPublicKey,
  type ReferralPublicInfo,
} from "@oko-wallet/oko-pg-interface/referrals";
import { getWalletById } from "@oko-wallet/oko-pg-interface/ewallet_wallets";

import {
  type UserAuthenticatedRequest,
  userJwtMiddleware,
} from "@oko-wallet-social-login-api/middleware/user_auth";
import { rateLimitMiddleware } from "@oko-wallet-social-login-api/middleware/rate_limit";

interface SaveReferralRequest {
  origin: string;
  utm_source?: string | null;
  utm_campaign?: string | null;
}

interface SaveReferralResponse {
  referral_id: string;
}

interface GetReferralResponse {
  referrals: Array<{
    utm_source: string | null;
    utm_campaign: string | null;
    created_at: string;
  }>;
}

export function setReferralRoutes(router: Router) {
  // POST /referral - Save referral (requires auth)
  registry.registerPath({
    method: "post",
    path: "/social-login/v1/referral",
    tags: ["Social Login"],
    summary: "Save referral information",
    description: "Records referral attribution data after successful keygen",
    security: [{ userAuth: [] }],
    request: {
      headers: UserAuthHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: SaveReferralRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Referral saved successfully",
        content: {
          "application/json": {
            schema: SaveReferralSuccessResponseSchema,
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
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  router.post(
    "/referral",
    rateLimitMiddleware({ windowSeconds: 60, maxRequests: 10 }),
    userJwtMiddleware,
    async (
      req: UserAuthenticatedRequest<SaveReferralRequest>,
      res: Response<OkoApiResponse<SaveReferralResponse>>,
    ) => {
      try {
        const state = req.app.locals;
        const { wallet_id } = res.locals.user;
        const { origin, utm_source, utm_campaign } = req.body;

        if (!origin) {
          res.status(400).json({
            success: false,
            code: "INVALID_REQUEST",
            msg: "origin is required",
          });
          return;
        }

        // Get wallet to retrieve user_id and public_key
        const walletRes = await getWalletById(state.db, wallet_id);
        if (!walletRes.success) {
          res.status(500).json({
            success: false,
            code: "UNKNOWN_ERROR",
            msg: walletRes.err,
          });
          return;
        }

        if (!walletRes.data) {
          res.status(404).json({
            success: false,
            code: "WALLET_NOT_FOUND",
            msg: "Wallet not found",
          });
          return;
        }

        const wallet = walletRes.data;

        const createRes = await createReferral(state.db, {
          user_id: wallet.user_id,
          public_key: wallet.public_key,
          origin,
          utm_source: utm_source ?? null,
          utm_campaign: utm_campaign ?? null,
        });

        if (!createRes.success) {
          res.status(500).json({
            success: false,
            code: "UNKNOWN_ERROR",
            msg: createRes.err,
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: { referral_id: createRes.data.referral_id },
        });
      } catch (error) {
        console.error("Save referral error:", error);
        res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: "Internal server error",
        });
      }
    },
  );

  // GET /referral - Query referral by public key (no auth)
  registry.registerPath({
    method: "get",
    path: "/social-login/v1/referral",
    tags: ["Social Login"],
    summary: "Get referral information by public key",
    description:
      "Public API to retrieve referral attribution data. No authentication required.",
    security: [],
    request: {
      query: GetReferralQuerySchema,
    },
    responses: {
      200: {
        description: "Referral data retrieved successfully (empty array if none found)",
        content: {
          "application/json": {
            schema: GetReferralSuccessResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid public key format",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  router.get(
    "/referral",
    rateLimitMiddleware({ windowSeconds: 60, maxRequests: 30 }),
    async (
      req: Request<{}, {}, {}, { public_key: string }>,
      res: Response<OkoApiResponse<GetReferralResponse>>,
    ) => {
      try {
        const state = req.app.locals;
        const { public_key } = req.query;

        if (!public_key || typeof public_key !== "string") {
          res.status(400).json({
            success: false,
            code: "INVALID_REQUEST",
            msg: "public_key query parameter is required",
          });
          return;
        }

        const publicKeyRes = Bytes.fromHexString(public_key, 33);
        if (!publicKeyRes.success) {
          res.status(400).json({
            success: false,
            code: "INVALID_PUBLIC_KEY",
            msg: "Invalid public key format. Expected 33-byte hex string.",
          });
          return;
        }

        const referralsRes = await getReferralsByPublicKey(
          state.db,
          Buffer.from(publicKeyRes.data.toUint8Array()),
        );

        if (!referralsRes.success) {
          res.status(500).json({
            success: false,
            code: "UNKNOWN_ERROR",
            msg: referralsRes.err,
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: {
            referrals: referralsRes.data.map((r: ReferralPublicInfo) => ({
              utm_source: r.utm_source,
              utm_campaign: r.utm_campaign,
              created_at: r.created_at.toISOString(),
            })),
          },
        });
      } catch (error) {
        console.error("Get referral error:", error);
        res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: "Internal server error",
        });
      }
    },
  );
}
