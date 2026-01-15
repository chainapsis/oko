import type { Response } from "express";
import type {
  RegisterKeyShareV2Request,
  RegisterKeyShareV2RequestBody,
} from "@oko-wallet/ksn-interface/key_share";
import { Bytes } from "@oko-wallet/bytes";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import { registerKeyShareV2 } from "@oko-wallet-ksn-server/api/key_share";
import type { AuthenticatedRequest } from "@oko-wallet-ksn-server/middlewares";
import { ErrorCodeMap } from "@oko-wallet-ksn-server/error";
import type { ResponseLocal } from "@oko-wallet-ksn-server/routes/io";
import { registry } from "@oko-wallet-ksn-server/openapi/doc";
import {
  RegisterKeyShareV2RequestBodySchema,
  RegisterKeyShareV2SuccessResponseSchema,
  ErrorResponseSchema,
} from "@oko-wallet-ksn-server/openapi/schema";

// --- POST /register ---
registry.registerPath({
  method: "post",
  path: "/keyshare/v2/register",
  tags: ["Key Share v2"],
  summary: "Register multiple key shares",
  description:
    "Register multiple key shares for the authenticated user in a single transaction.",
  security: [{ oauthAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: RegisterKeyShareV2RequestBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully registered key shares",
      content: {
        "application/json": {
          schema: RegisterKeyShareV2SuccessResponseSchema,
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
                msg: "Public key is not valid",
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
                msg: "Duplicate public key for curve_type: secp256k1",
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

export async function keyshareV2Register(
  req: AuthenticatedRequest<RegisterKeyShareV2RequestBody>,
  res: Response<KSNodeApiResponse<void>, ResponseLocal>,
) {
  const oauthUser = res.locals.oauth_user;
  const auth_type = oauthUser.type;
  const state = req.app.locals;
  const body = req.body;

  // Validate and convert wallets object
  const validatedWallets: RegisterKeyShareV2Request["wallets"] = {};

  // Validate secp256k1
  if (body.wallets.secp256k1) {
    const publicKeyBytesRes = Bytes.fromHexString(
      body.wallets.secp256k1.public_key,
      33,
    );
    if (publicKeyBytesRes.success === false) {
      return res.status(400).json({
        success: false,
        code: "PUBLIC_KEY_INVALID",
        msg: `Public key is not valid for secp256k1: ${publicKeyBytesRes.err}`,
      });
    }
    const shareBytesRes = Bytes.fromHexString(body.wallets.secp256k1.share, 64);
    if (shareBytesRes.success === false) {
      return res.status(400).json({
        success: false,
        code: "SHARE_INVALID",
        msg: `Share is not valid for secp256k1: ${shareBytesRes.err}`,
      });
    }
    validatedWallets.secp256k1 = {
      public_key: publicKeyBytesRes.data,
      share: shareBytesRes.data,
    };
  }

  // Validate ed25519
  if (body.wallets.ed25519) {
    const publicKeyBytesRes = Bytes.fromHexString(
      body.wallets.ed25519.public_key,
      32,
    );
    if (publicKeyBytesRes.success === false) {
      return res.status(400).json({
        success: false,
        code: "PUBLIC_KEY_INVALID",
        msg: `Public key is not valid for ed25519: ${publicKeyBytesRes.err}`,
      });
    }
    const shareBytesRes = Bytes.fromHexString(body.wallets.ed25519.share, 64);
    if (shareBytesRes.success === false) {
      return res.status(400).json({
        success: false,
        code: "SHARE_INVALID",
        msg: `Share is not valid for ed25519: ${shareBytesRes.err}`,
      });
    }
    validatedWallets.ed25519 = {
      public_key: publicKeyBytesRes.data,
      share: shareBytesRes.data,
    };
  }

  const result = await registerKeyShareV2(
    state.db,
    {
      user_auth_id: oauthUser.user_identifier,
      auth_type,
      wallets: validatedWallets,
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
