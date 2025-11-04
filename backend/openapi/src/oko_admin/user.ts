import { z } from "zod";

import { registry } from "../registry";

export const LoginRequestSchema = registry.register(
  "LoginRequest",
  z.object({
    email: z.email().openapi({
      description: "Admin email address",
    }),
    password: z.string().openapi({
      description: "Admin password",
    }),
  }),
);

const AdminInfoSchema = registry.register(
  "AdminInfo",
  z.object({
    user_id: z.string().openapi({
      description: "Unique admin identifier",
    }),
    role: z.string().openapi({
      description: "Admin role",
    }),
  }),
);

const AdminLoginResultSchema = registry.register(
  "AdminLoginResult",
  z.object({
    admin: AdminInfoSchema.openapi({
      description: "Admin account info",
    }),
    token: z.string().openapi({
      description: "JWT token for authentication",
    }),
  }),
);

const AdminLogoutResultSchema = registry.register(
  "AdminLogoutResult",
  z.object({
    message: z.string().openapi({
      description: "Logout success message",
    }),
  }),
);

// export const AdminLoginSuccessResponseSchema = makeSuccessResponseSchema(
//   AdminLoginResultSchema,
//   "AdminLoginSuccessResponse",
// );
export const AdminLoginSuccessResponseSchema = registry.register(
  "AdminLoginSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: AdminLoginResultSchema,
  }),
);

// export const AdminLogoutSuccessResponseSchema = makeSuccessResponseSchema(
//   AdminLogoutResultSchema,
//   "AdminLogoutSuccessResponse",
// );
export const AdminLogoutSuccessResponseSchema = registry.register(
  "AdminLogoutSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: AdminLogoutResultSchema,
  }),
);
