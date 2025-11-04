import { z } from "zod";

import { registry } from "../registry";

export const CustomerAuthHeaderSchema = z.object({
  Authorization: z
    .string()
    .regex(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/)
    .openapi({
      description: "Customer dashboard bearer token",
      example: "Bearer eyJhbGciOiJIUzI1NiIs...",
      param: {
        name: "Authorization",
        in: "header",
        required: true,
      },
    }),
});

export const SendVerificationRequestSchema = registry.register(
  "CustomerDashboardSendVerificationRequest",
  z.object({
    email: z.email().openapi({
      description: "Email address to send verification code",
    }),
  }),
);

const SendVerificationResponseSchema = registry.register(
  "CustomerDashboardSendVerificationResponse",
  z.object({
    message: z.string().openapi({
      description: "Success message indicating verification code was sent",
    }),
  }),
);

// export const SendVerificationSuccessResponseSchema = makeSuccessResponseSchema(
//   SendVerificationResponseSchema,
//   "CustomerDashboardSendVerificationSuccessResponse",
// );

export const SendVerificationSuccessResponseSchema = registry.register(
  "CustomerDashboardSendVerificationSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: SendVerificationResponseSchema,
  }),
);

export const VerifyAndLoginRequestSchema = registry.register(
  "CustomerDashboardVerifyAndLoginRequest",
  z.object({
    email: z.email().openapi({
      description: "Email address to verify",
    }),
    verification_code: z.string().openapi({
      description: "Verification code received via email",
    }),
  }),
);

export const SignInRequestSchema = registry.register(
  "CustomerDashboardSignInRequest",
  z.object({
    email: z.email().openapi({
      description: "Email address for sign in",
    }),
    password: z.string().min(4).openapi({
      description: "Password for sign in",
    }),
  }),
);

const LoginCustomerSchema = registry.register(
  "CustomerDashboardLoginCustomer",
  z.object({
    email: z.email().openapi({
      description: "Customer email address",
    }),
    is_email_verified: z.boolean().openapi({
      description: "Whether the email has been verified",
    }),
  }),
);

const LoginResponseSchema = registry.register(
  "CustomerDashboardLoginResponse",
  z.object({
    token: z.string().openapi({
      description: "JWT token for authentication",
    }),
    customer: LoginCustomerSchema.openapi({
      description: "Customer information",
    }),
  }),
);

// export const LoginSuccessResponseSchema = makeSuccessResponseSchema(
//   LoginResponseSchema,
//   "CustomerDashboardLoginSuccessResponse",
// );
export const LoginSuccessResponseSchema = registry.register(
  "CustomerDashboardLoginSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: LoginResponseSchema,
  }),
);

export const ChangePasswordRequestSchema = registry.register(
  "CustomerDashboardChangePasswordRequest",
  z.object({
    email: z.email().openapi({
      description: "Email address of the account",
    }),
    new_password: z.string().min(8).openapi({
      description: "New password to set",
    }),
    original_password: z.string().optional().openapi({
      description: "Current password for verification",
    }),
  }),
);

const ChangePasswordResponseSchema = registry.register(
  "CustomerDashboardChangePasswordResponse",
  z.object({
    message: z.string().openapi({
      description: "Success message indicating password was changed",
    }),
  }),
);

// export const ChangePasswordSuccessResponseSchema = makeSuccessResponseSchema(
//   ChangePasswordResponseSchema,
//   "CustomerDashboardChangePasswordSuccessResponse",
// );

export const ChangePasswordSuccessResponseSchema = registry.register(
  "CustomerDashboardChangePasswordSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: ChangePasswordResponseSchema,
  }),
);
