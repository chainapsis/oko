import { z } from "zod";

import { registry } from "../registry";

const KsNodeStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);
const WalletStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "NOT_REGISTERED",
  "UNRECOVERABLE_DATA_LOSS",
]);
const ReshareReasonEnum = z.enum(["UNRECOVERABLE_NODE_DATA_LOSS"]);

export const SignInResponseSchema = registry.register(
  "TssUserSignInResponse",
  z.object({
    token: z.string().openapi({
      description: "JWT token for authentication",
    }),
    user: z
      .object({
        email: z.string().openapi({
          description: "User email address",
        }),
        wallet_id: z.string().openapi({
          description: "Unique wallet identifier",
        }),
        public_key: z.string().openapi({
          description: "Public key in hex format",
        }),
      })
      .openapi({ description: "Authenticated user information" }),
  }),
);

// export const SignInSuccessResponseSchema = makeSuccessResponseSchema(
//   SignInResponseSchema,
//   "TssUserSignInSuccessResponse",
// );
export const SignInSuccessResponseSchema = registry.register(
  "TssUserSignInSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: SignInResponseSchema,
  }),
);

const AuthTypeEnum = z.enum(["google", "auth0", "x", "telegram", "discord"]);

export const CheckEmailRequestSchema = registry.register(
  "TssUserCheckEmailRequest",
  z.object({
    email: z.email().openapi({
      description: "User email address to check",
    }),
    auth_type: AuthTypeEnum.optional().default("google").openapi({
      description: "Authentication provider type (defaults to 'google')",
    }),
  }),
);

const KeyshareNodeSchema = registry.register(
  "TssUserKeyshareNodeMeta",
  z.object({
    name: z.string(),
    endpoint: z.string(),
    status: KsNodeStatusEnum,
    wallet_status: WalletStatusEnum,
  }),
);

const CheckEmailDataSchema = registry.register(
  "TssUserCheckEmailData",
  z.object({
    exists: z.boolean().openapi({
      description: "Whether a user with the given email exists",
    }),
    keyshare_node_meta: z
      .object({
        threshold: z.number().int().openapi({
          description: "Keyshare threshold",
        }),
        nodes: z.array(KeyshareNodeSchema).openapi({
          description: "Keyshare nodes metadata",
        }),
      })
      .openapi({ description: "Keyshare node metadata" }),
    needs_reshare: z.boolean().openapi({
      description: "True when wallet has unrecoverable node data loss",
    }),
    reshare_reasons: z
      .array(ReshareReasonEnum)
      .nullable()
      .openapi({ description: "Reasons why reshare is required" }),
    reshare_ready: z.boolean().openapi({
      description: "True when KS nodes are active and reshare is needed",
    }),
    signup_ready: z.boolean().openapi({
      description: "True when all KS nodes are active",
    }),
    active_nodes_below_threshold: z.boolean().openapi({
      description:
        "True when count of active KS nodes is below global SSS threshold",
    }),
  }),
);

// export const CheckEmailSuccessResponseSchema = makeSuccessResponseSchema(
//   CheckEmailDataSchema,
//   "TssUserCheckEmailSuccessResponse",
// );
export const CheckEmailSuccessResponseSchema = registry.register(
  "TssUserCheckEmailSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: CheckEmailDataSchema,
  }),
);

const SignInSilentlyDataSchema = registry.register(
  "TssUserSignInSilentlyResponse",
  z.object({
    token: z.string().nullable().openapi({
      description:
        "New JWT token when refreshed or null if existing token is still valid",
    }),
  }),
);

// export const SignInSilentlySuccessResponseSchema = makeSuccessResponseSchema(
//   SignInSilentlyDataSchema,
//   "TssUserSignInSilentlySuccessResponse",
// );
export const SignInSilentlySuccessResponseSchema = registry.register(
  "TssUserSignInSilentlySuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: SignInSilentlyDataSchema,
  }),
);
