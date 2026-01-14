import { type Response } from "express";
import type { RegisterEd25519V2RequestBody } from "@oko-wallet/ksn-interface/key_share";
import { Bytes } from "@oko-wallet/bytes";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import { registerEd25519V2 } from "@oko-wallet-ksn-server/api/key_share";
import { type AuthenticatedRequest } from "@oko-wallet-ksn-server/middlewares";
import { ErrorCodeMap } from "@oko-wallet-ksn-server/error";
import type { ResponseLocal } from "@oko-wallet-ksn-server/routes/io";
import { registry } from "@oko-wallet-ksn-server/openapi/doc";
import {
  RegisterEd25519V2RequestBodySchema,
  RegisterEd25519V2SuccessResponseSchema,
  ErrorResponseSchema,
} from "@oko-wallet-ksn-server/openapi/schema";

// --- POST /register/ed25519 ---
registry.registerPath({
  method: "post",
  path: "/keyshare/v2/register/ed25519",
  tags: ["Key Share v2"],
  summary: "Register ed25519 wallet for existing users",
  description:
    "Register ed25519 wallet for users who already have secp256k1 wallet.",
  security: [{ oauthAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: RegisterEd25519V2RequestBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully registered ed25519 wallet",
      content: {
        "application/json": {
          schema: RegisterEd25519V2SuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            PUBLIC_KEY_INVALID: {
              value: {
                success: false,
                code: "PUBLIC_KEY_INVALID",
                msg: "Public key is not valid for ed25519",
              },
            },
            SHARE_INVALID: {
              value: {
                success: false,
                code: "SHARE_INVALID",
                msg: "Share is not valid",
              },
            },
            DUPLICATE_PUBLIC_KEY: {
              value: {
                success: false,
                code: "DUPLICATE_PUBLIC_KEY",
                msg: "ed25519 wallet already exists",
              },
            },
          },
        },
      },
    },
    401: {
      description: "Unauthorized - Invalid or missing bearer token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Not found - User or secp256k1 wallet not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            USER_NOT_FOUND: {
              value: {
                success: false,
                code: "USER_NOT_FOUND",
                msg: "User not found",
              },
            },
            WALLET_NOT_FOUND: {
              value: {
                success: false,
                code: "WALLET_NOT_FOUND",
                msg: "secp256k1 wallet not found (not an existing user)",
              },
            },
          },
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export async function registerKeyshareEd25519(
  req: AuthenticatedRequest<RegisterEd25519V2RequestBody>,
  res: Response<KSNodeApiResponse<void>, ResponseLocal>,
) {
  const oauthUser = res.locals.oauth_user;
  const auth_type = oauthUser.type;
  const state = req.app.locals;
  const body = req.body;

  // Validate public_key (ed25519 = 32 bytes)
  const publicKeyBytesRes = Bytes.fromHexString(body.public_key, 32);
  if (publicKeyBytesRes.success === false) {
    return res.status(400).json({
      success: false,
      code: "PUBLIC_KEY_INVALID",
      msg: `Public key is not valid for ed25519: ${publicKeyBytesRes.err}`,
    });
  }

  // Validate share (64 bytes)
  const shareBytesRes = Bytes.fromHexString(body.share, 64);
  if (shareBytesRes.success === false) {
    return res.status(400).json({
      success: false,
      code: "SHARE_INVALID",
      msg: `Share is not valid: ${shareBytesRes.err}`,
    });
  }

  const result = await registerEd25519V2(
    state.db,
    {
      user_auth_id: oauthUser.user_identifier,
      auth_type,
      public_key: publicKeyBytesRes.data,
      share: shareBytesRes.data,
    },
    state.encryptionSecret,
  );

  if (result.success === false) {
    return res.status(ErrorCodeMap[result.code]).json({
      success: false,
      code: result.code,
      msg: result.msg,
    });
  }

  return res.status(200).json({
    success: true,
    data: void 0,
  });
}
