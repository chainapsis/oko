import type { Response } from "express";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  ErrorResponseSchema,
  OAuthHeaderSchema,
  SuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { ReshareRequestV2Schema } from "@oko-wallet/oko-api-openapi/tss";
import { Bytes, type Bytes32, type Bytes33 } from "@oko-wallet/bytes";
import { registry } from "@oko-wallet/oko-api-openapi";

import { updateWalletKSNodesForReshareV2 } from "@oko-wallet-tss-api/api/v2/user";
import { type OAuthAuthenticatedRequest } from "@oko-wallet-tss-api/middleware/oauth";
import type { OAuthLocals } from "@oko-wallet-tss-api/middleware/types";

registry.registerPath({
  method: "post",
  path: "/tss/v2/user/reshare",
  tags: ["TSS"],
  summary: "Reshare wallet key shares",
  description:
    "Updates wallet key share nodes after unrecoverable data loss using provided reshared shares for multiple wallets (secp256k1 and/or ed25519)",
  security: [{ oauthAuth: [] }],
  request: {
    headers: OAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ReshareRequestV2Schema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Reshare request accepted",
      content: {
        "application/json": {
          schema: SuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - Invalid or missing OAuth token",
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

export async function userReshareV2(
  req: OAuthAuthenticatedRequest<{
    wallets: {
      secp256k1?: string;
      ed25519?: string;
    };
    reshared_key_shares: Array<{
      name: string;
      endpoint: string;
    }>;
  }>,
  res: Response<OkoApiResponse<void>, OAuthLocals>,
) {
  const state = req.app.locals;
  const oauthUser = res.locals.oauth_user;
  const auth_type = oauthUser.type as AuthType;
  const user_identifier = oauthUser.user_identifier;
  const { wallets, reshared_key_shares } = req.body;

  if (!user_identifier) {
    res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      msg: "User identifier not found",
    });
    return;
  }

  if (!wallets.secp256k1 && !wallets.ed25519) {
    res.status(400).json({
      success: false,
      code: "INVALID_REQUEST",
      msg: "At least one wallet (secp256k1 or ed25519) must be provided",
    });
    return;
  }

  const walletsBytes: {
    secp256k1?: Bytes33;
    ed25519?: Bytes32;
  } = {};

  if (wallets.secp256k1) {
    const secp256k1PublicKeyRes = Bytes.fromHexString(wallets.secp256k1, 33);
    if (secp256k1PublicKeyRes.success === false) {
      res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        msg: `Invalid secp256k1 public key: ${secp256k1PublicKeyRes.err}`,
      });
      return;
    }
    walletsBytes.secp256k1 = secp256k1PublicKeyRes.data;
  }

  if (wallets.ed25519) {
    const ed25519PublicKeyRes = Bytes.fromHexString(wallets.ed25519, 32);
    if (ed25519PublicKeyRes.success === false) {
      res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        msg: `Invalid ed25519 public key: ${ed25519PublicKeyRes.err}`,
      });
      return;
    }
    walletsBytes.ed25519 = ed25519PublicKeyRes.data;
  }

  if (!reshared_key_shares?.length) {
    res.status(400).json({
      success: false,
      code: "INVALID_REQUEST",
      msg: "reshared_key_shares is required",
    });
    return;
  }

  const reshareRes = await updateWalletKSNodesForReshareV2(
    state.db,
    user_identifier,
    auth_type,
    walletsBytes,
    reshared_key_shares,
  );

  if (reshareRes.success === false) {
    res.status(ErrorCodeMap[reshareRes.code] ?? 500).json(reshareRes);
    return;
  }

  res.status(200).json({
    success: true,
    data: void 0,
  });
}
