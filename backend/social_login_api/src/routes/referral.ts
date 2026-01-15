import type { Request, Response, Router } from "express";

import { Bytes } from "@oko-wallet/bytes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  ErrorResponseSchema,
  UserAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  GetReferralQuerySchema,
  GetReferralSuccessResponseSchema,
  SaveReferralRequestSchema,
  SaveReferralSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/social_login";
import {
  createReferral,
  getReferralsByPublicKeyAndOrigin,
  type ReferralPublicInfo,
} from "@oko-wallet/oko-pg-interface/referrals";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";

const CIVITIA_ORIGIN = "https://app.civitia.org";

import { getWalletById } from "@oko-wallet/oko-pg-interface/oko_wallets";
import { rateLimitMiddleware } from "@oko-wallet-social-login-api/middleware/rate_limit";
import {
  type UserAuthenticatedRequest,
  userJwtMiddleware,
} from "@oko-wallet-social-login-api/middleware/user_auth";

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

  // GET /referrals/civitia - Civitia-specific referral query (no auth)
  registry.registerPath({
    method: "get",
    path: "/social-login/v1/referrals/civitia",
    tags: ["Social Login"],
    summary: "Get Civitia referral information by public key",
    description:
      "Public API for Civitia to retrieve referral attribution data. Only returns referrals from Civitia origin.",
    security: [],
    request: {
      query: GetReferralQuerySchema,
    },
    responses: {
      200: {
        description:
          "Referral data retrieved successfully (empty array if none found)",
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
    "/referrals/civitia",
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

        const referralsRes = await getReferralsByPublicKeyAndOrigin(
          state.db,
          Buffer.from(publicKeyRes.data.toUint8Array()),
          CIVITIA_ORIGIN,
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
        console.error("Get Civitia referral error:", error);
        res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: "Internal server error",
        });
      }
    },
  );
}
