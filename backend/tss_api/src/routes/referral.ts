import type { Response, Router, Request } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import {
  ErrorResponseSchema,
  UserAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { registry } from "@oko-wallet/oko-api-openapi";
import { z } from "zod";
import { Bytes } from "@oko-wallet/bytes";

import {
  type UserAuthenticatedRequest,
  userJwtMiddleware,
} from "@oko-wallet-tss-api/middleware/keplr_auth";
import {
  createReferral,
  getReferralsByPublicKey,
  type ReferralPublicInfo,
} from "@oko-wallet/oko-pg-interface/referrals";
import { getWalletById } from "@oko-wallet/oko-pg-interface/ewallet_wallets";

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

const SaveReferralRequestSchema = z.object({
  origin: z.string().min(1).max(512),
  utm_source: z.string().max(128).nullable().optional(),
  utm_campaign: z.string().max(128).nullable().optional(),
});

const SaveReferralSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    referral_id: z.string().uuid(),
  }),
});

export function setReferralRoutes(router: Router) {
  registry.registerPath({
    method: "post",
    path: "/tss/v1/referral",
    tags: ["TSS"],
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

  // Public API - Get referral by public key (no auth required)
  const GetReferralSuccessResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
      referrals: z.array(
        z.object({
          utm_source: z.string().nullable(),
          utm_campaign: z.string().nullable(),
          created_at: z.string().datetime(),
        }),
      ),
    }),
  });

  registry.registerPath({
    method: "get",
    path: "/tss/v1/referral",
    tags: ["TSS"],
    summary: "Get referral information by public key",
    description:
      "Public API to retrieve referral attribution data. No authentication required.",
    security: [],
    request: {
      query: z.object({
        public_key: z.string().length(66).regex(/^[0-9a-fA-F]+$/),
      }),
    },
    responses: {
      200: {
        description: "Referral data retrieved successfully",
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
      404: {
        description: "No referrals found",
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

        if (referralsRes.data.length === 0) {
          res.status(404).json({
            success: false,
            code: "REFERRAL_NOT_FOUND",
            msg: "No referrals found for this public key",
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
