import { z } from "zod";

import { registry } from "../registry";

export const SaveReferralRequestSchema = registry.register(
  "SaveReferralRequest",
  z.object({
    origin: z.string().min(1).max(512).openapi({
      description: "Origin URL of the dApp",
    }),
    utm_source: z.string().max(128).nullable().optional().openapi({
      description: "UTM source parameter",
    }),
    utm_campaign: z.string().max(128).nullable().optional().openapi({
      description: "UTM campaign parameter",
    }),
  }),
);

export const SaveReferralResponseSchema = registry.register(
  "SaveReferralResponse",
  z.object({
    referral_id: z.string().uuid().openapi({
      description: "Created referral ID",
    }),
  }),
);

export const SaveReferralSuccessResponseSchema = registry.register(
  "SaveReferralSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: SaveReferralResponseSchema,
  }),
);

export const GetReferralQuerySchema = z.object({
  public_key: z
    .string()
    .length(66)
    .regex(/^[0-9a-fA-F]+$/)
    .openapi({
      description: "Public key in hex format (33 bytes)",
    }),
});

const ReferralInfoSchema = registry.register(
  "ReferralInfo",
  z.object({
    utm_source: z.string().nullable().openapi({
      description: "UTM source parameter",
    }),
    utm_campaign: z.string().nullable().openapi({
      description: "UTM campaign parameter",
    }),
    created_at: z.string().datetime().openapi({
      description: "Referral creation timestamp",
    }),
  }),
);

export const GetReferralResponseSchema = registry.register(
  "GetReferralResponse",
  z.object({
    referrals: z.array(ReferralInfoSchema).openapi({
      description: "List of referral records",
    }),
  }),
);

export const GetReferralSuccessResponseSchema = registry.register(
  "GetReferralSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: GetReferralResponseSchema,
  }),
);
