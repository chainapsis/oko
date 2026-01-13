import { registry } from "../registry";
import { z } from "zod";
import { authTypeSchema, publicKeySchema, shareSchema } from "./key_share_v1";

// ============================================================================
// Shared Schemas
// ============================================================================

export const walletsRequestBodySchema = z
  .object({
    secp256k1: publicKeySchema
      .optional()
      .describe("secp256k1 public key (33 bytes hex)"),
    ed25519: publicKeySchema
      .optional()
      .describe("ed25519 public key (32 bytes hex)"),
  })
  .refine((data) => data.secp256k1 || data.ed25519, {
    message: "At least one of secp256k1 or ed25519 must be provided",
  });

// ============================================================================
// GET /v2/keyshare
// ============================================================================

export const GetKeyShareV2RequestBodySchema = registry.register(
  "GetKeyShareV2RequestBody",
  z
    .object({
      wallets: walletsRequestBodySchema.describe(
        "Object with curve_type as key and public_key as value",
      ),
    })
    .openapi("GetKeyShareV2RequestBody", {
      description:
        "Request payload for retrieving multiple key shares at once.",
    }),
);

const walletResponseSchema = z.object({
  share_id: z
    .string()
    .uuid()
    .describe("Unique identifier for the key share")
    .openapi({ example: "3c98f82a-4ec6-4de4-9d8f-1e2b4a8d5c3f" }),
  share: shareSchema,
});

export const GetKeyShareV2ResponseSchema = registry.register(
  "GetKeyShareV2Response",
  z
    .object({
      secp256k1: walletResponseSchema.optional(),
      ed25519: walletResponseSchema.optional(),
    })
    .openapi("GetKeyShareV2Response", {
      description:
        "Response payload containing decrypted key shares by curve type.",
    }),
);

export const GetKeyShareV2SuccessResponseSchema = registry.register(
  "GetKeyShareV2SuccessResponse",
  z
    .object({
      success: z.literal(true),
      data: GetKeyShareV2ResponseSchema,
    })
    .openapi("GetKeyShareV2SuccessResponse", {
      description: "Success response containing multiple decrypted key shares.",
    }),
);

// ============================================================================
// POST /v2/keyshare/check
// ============================================================================

export const CheckKeyShareV2RequestBodySchema = registry.register(
  "CheckKeyShareV2RequestBody",
  z
    .object({
      user_auth_id: z
        .string()
        .describe("User authentication ID")
        .openapi({ example: "test@example.com" }),
      auth_type: authTypeSchema,
      wallets: walletsRequestBodySchema.describe(
        "Object with curve_type as key and public_key as value",
      ),
    })
    .openapi("CheckKeyShareV2RequestBody", {
      description:
        "Request payload for checking existence of multiple key shares.",
    }),
);

const checkWalletResponseSchema = z.object({
  exists: z
    .boolean()
    .describe("Whether the key share exists")
    .openapi({ example: true }),
});

export const CheckKeyShareV2ResponseSchema = registry.register(
  "CheckKeyShareV2Response",
  z
    .object({
      secp256k1: checkWalletResponseSchema.optional(),
      ed25519: checkWalletResponseSchema.optional(),
    })
    .openapi("CheckKeyShareV2Response", {
      description:
        "Response payload indicating key share existence by curve type.",
    }),
);

export const CheckKeyShareV2SuccessResponseSchema = registry.register(
  "CheckKeyShareV2SuccessResponse",
  z
    .object({
      success: z.literal(true),
      data: CheckKeyShareV2ResponseSchema,
    })
    .openapi("CheckKeyShareV2SuccessResponse", {
      description: "Success response indicating key share existence status.",
    }),
);

// ============================================================================
// POST /v2/keyshare/register
// ============================================================================

const walletRegisterInfoSchema = z.object({
  public_key: publicKeySchema.describe("Public key in hex string format"),
  share: shareSchema.describe("Key share in hex string format (64 bytes)"),
});

export const walletsRegisterRequestBodySchema = z
  .object({
    secp256k1: walletRegisterInfoSchema
      .optional()
      .describe("secp256k1 wallet registration info"),
    ed25519: walletRegisterInfoSchema
      .optional()
      .describe("ed25519 wallet registration info"),
  })
  .refine((data) => data.secp256k1 || data.ed25519, {
    message: "At least one of secp256k1 or ed25519 must be provided",
  });

export const RegisterKeyShareV2RequestBodySchema = registry.register(
  "RegisterKeyShareV2RequestBody",
  z
    .object({
      wallets: walletsRegisterRequestBodySchema.describe(
        "Object with curve_type as key and wallet info as value",
      ),
    })
    .openapi("RegisterKeyShareV2RequestBody", {
      description:
        "Request payload for registering multiple key shares at once.",
    }),
);

export const RegisterKeyShareV2SuccessResponseSchema = registry.register(
  "RegisterKeyShareV2SuccessResponse",
  z
    .object({
      success: z.literal(true),
      data: z.null(),
    })
    .openapi("RegisterKeyShareV2SuccessResponse", {
      description: "Success response for key share registration.",
    }),
);
