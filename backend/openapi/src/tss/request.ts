import { z } from "zod";

import { registry } from "../registry";

const OAuthTypeSchema = z.enum(["google", "auth0"]).openapi({
  description: "OAuth provider type",
  example: "google",
});

export const SignInRequestSchema = registry.register(
  "TssUserSignInRequest",
  z.object({
    auth_type: OAuthTypeSchema,
  }),
);

export const KeygenRequestSchema = registry.register(
  "TssKeygenRequest",
  z.object({
    auth_type: OAuthTypeSchema,
    keygen_2: z
      .object({
        private_share: z.string().openapi({
          description: "Private key share for TSS",
        }),
        public_key: z.string().openapi({
          description: "Public key in hex format",
        }),
      })
      .openapi({
        description: "Keygen stage 2 payload",
      }),
  }),
);

export const ReshareRequestSchema = registry.register(
  "TssUserReshareRequest",
  z.object({
    auth_type: OAuthTypeSchema,
    public_key: z.string().openapi({
      description: "Wallet public key in hex format",
    }),
    reshared_key_shares: z
      .array(
        z.object({
          name: z.string().openapi({
            description: "Key share node name",
          }),
          endpoint: z.string().openapi({
            description: "Key share node endpoint",
          }),
        }),
      )
      .openapi({ description: "Reshared key shares grouped by node" }),
  }),
);
