import { z } from "zod";

import { registry } from "../registry";

export const XAuthHeaderSchema = z.object({
  Authorization: z.string().openapi({
    description: "X access token as Bearer token",
    example: "Bearer AAAAAAAAAAAAAAAAAAAAA",
    param: {
      name: "Authorization",
      in: "header",
      required: true,
    },
  }),
});

export const SocialLoginXRequestSchema = registry.register(
  "SocialLoginXRequest",
  z.object({
    code: z.string().openapi({
      description: "Authorization code from X",
    }),
    code_verifier: z.string().openapi({
      description: "PKCE code verifier",
    }),
    redirect_uri: z.string().openapi({
      description: "Redirect URI used in OAuth flow",
    }),
  }),
);

const SocialLoginXResponseSchema = registry.register(
  "SocialLoginXResponse",
  z.object({
    access_token: z.string().openapi({
      description: "Access token issued by X",
    }),
    refresh_token: z.string().optional().openapi({
      description: "Refresh token issued by X (optional)",
    }),
    expires_in: z.number().int().optional().openapi({
      description: "Access token expiration time in seconds",
    }),
    token_type: z.string().optional().openapi({
      description: "Token type (typically 'bearer')",
    }),
    scope: z.string().optional().openapi({
      description: "Granted OAuth scopes",
    }),
  }),
);

export const SocialLoginXSuccessResponseSchema = registry.register(
  "SocialLoginXSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: SocialLoginXResponseSchema,
  }),
);

const SocialLoginXVerifyUserResponseSchema = registry.register(
  "SocialLoginXVerifyUserResponse",
  z.object({
    id: z.string().openapi({
      description: "X user ID",
    }),
    name: z.string().openapi({
      description: "User display name",
    }),
    username: z.string().openapi({
      description: "X username",
    }),
    email: z.string().optional().openapi({
      description: "User email address (if provided by X)",
    }),
  }),
);

export const SocialLoginXVerifyUserSuccessResponseSchema = registry.register(
  "SocialLoginXVerifyUserSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: SocialLoginXVerifyUserResponseSchema,
  }),
);
