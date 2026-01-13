import { Router, type Response } from "express";
import type {
  CheckKeyShareRequestBody,
  CheckKeyShareResponse,
  GetKeyShareRequestBody,
  GetKeyShareResponse,
  GetKeyShareV2Request,
  GetKeyShareV2RequestBody,
  GetKeyShareV2Response,
  RegisterKeyShareBody,
  ReshareKeyShareBody,
} from "@oko-wallet/ksn-interface/key_share";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import { Bytes, type Bytes64 } from "@oko-wallet/bytes";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import {
  checkKeyShare,
  getKeyShare,
  getKeyShareV2,
  registerKeyShare,
  reshareKeyShare,
} from "@oko-wallet-ksn-server/api/key_share";
import {
  bearerTokenMiddleware,
  type AuthenticatedRequest,
} from "@oko-wallet-ksn-server/middlewares";
import { ErrorCodeMap } from "@oko-wallet-ksn-server/error";
import type {
  ResponseLocal,
  KSNodeRequest,
} from "@oko-wallet-ksn-server/routes/io";
import { registry } from "@oko-wallet-ksn-server/openapi/registry";
import {
  CheckKeyShareRequestBodySchema,
  GetKeyShareRequestBodySchema,
  GetKeyShareV2RequestBodySchema,
  GetKeyShareV2SuccessResponseSchema,
  RegisterKeyShareBodySchema,
  ReshareKeyShareBodySchema,
  ErrorResponseSchema,
  KeyShareEmptySuccessResponseSchema,
  GetKeyShareSuccessResponseSchema,
  CheckKeyShareSuccessResponseSchema,
} from "@oko-wallet-ksn-server/openapi/schema";

export function makeKeyshareRouter() {
  const router = Router();

  registry.registerPath({
    method: "post",
    path: "/keyshare/v1/register",
    tags: ["Key Share"],
    summary: "Register a new key share",
    description: "Register a new key share for the authenticated user.",
    security: [{ oauthAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: RegisterKeyShareBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully registered key share",
        content: {
          "application/json": {
            schema: KeyShareEmptySuccessResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
            examples: {
              CURVE_TYPE_NOT_SUPPORTED: {
                value: {
                  success: false,
                  code: "CURVE_TYPE_NOT_SUPPORTED",
                  msg: "Curve type not supported",
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
            examples: {
              UNAUTHORIZED: {
                value: {
                  success: false,
                  code: "UNAUTHORIZED",
                  msg: "Unauthorized",
                },
              },
            },
          },
        },
      },
      409: {
        description: "Conflict - Public key already exists",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
            examples: {
              DUPLICATE_PUBLIC_KEY: {
                value: {
                  success: false,
                  code: "DUPLICATE_PUBLIC_KEY",
                  msg: "Duplicate public key",
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
            examples: {
              UNKNOWN_ERROR: {
                value: {
                  success: false,
                  code: "UNKNOWN_ERROR",
                  msg: "{error message}",
                },
              },
            },
          },
        },
      },
    },
  });
  router.post(
    "/register",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<RegisterKeyShareBody>,
      res: Response<KSNodeApiResponse<void>, ResponseLocal>,
    ) => {
      const oauthUser = res.locals.oauth_user;
      const auth_type = oauthUser.type;
      const state = req.app.locals;
      const body = req.body;

      const publicKeyLength = body.curve_type === "ed25519" ? 32 : 33;
      const publicKeyBytesRes = Bytes.fromHexString(
        body.public_key,
        publicKeyLength,
      );
      if (publicKeyBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: `Public key is not valid: ${publicKeyBytesRes.err}`,
        });
      }

      const shareBytesRes = Bytes.fromHexString(body.share, 64);
      if (shareBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "SHARE_INVALID",
          msg: `Share is not valid: ${shareBytesRes.err}`,
        });
      }

      const shareBytes: Bytes64 = shareBytesRes.data;

      const registerKeyShareRes = await registerKeyShare(
        state.db,
        {
          user_auth_id: oauthUser.user_identifier,
          auth_type,
          curve_type: body.curve_type,
          public_key: publicKeyBytesRes.data,
          share: shareBytes,
        },
        state.encryptionSecret,
      );

      if (registerKeyShareRes.success === false) {
        return res.status(ErrorCodeMap[registerKeyShareRes.code]).json({
          success: false,
          code: registerKeyShareRes.code,
          msg: registerKeyShareRes.msg,
        });
      }

      return res.status(200).json({
        success: true,
        data: void 0,
      });
    },
  );

  registry.registerPath({
    method: "post",
    path: "/keyshare/v1",
    tags: ["Key Share"],
    summary: "Get a key share",
    description: "Retrieve a key share for the authenticated user.",
    security: [{ oauthAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: GetKeyShareRequestBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully retrieved key share",
        content: {
          "application/json": {
            schema: GetKeyShareSuccessResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
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
        description: "Not found - User, wallet or key share not found",
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
                  msg: "Wallet not found",
                },
              },
              KEY_SHARE_NOT_FOUND: {
                value: {
                  success: false,
                  code: "KEY_SHARE_NOT_FOUND",
                  msg: "Key share not found",
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
  router.post(
    "/",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<GetKeyShareRequestBody>,
      res: Response<KSNodeApiResponse<GetKeyShareResponse>, ResponseLocal>,
    ) => {
      const oauthUser = res.locals.oauth_user;
      const auth_type = oauthUser.type;
      const state = req.app.locals;

      const publicKeyLength = req.body.curve_type === "ed25519" ? 32 : 33;
      const publicKeyBytesRes = Bytes.fromHexString(
        req.body.public_key,
        publicKeyLength,
      );
      if (publicKeyBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: `Public key is not valid: ${publicKeyBytesRes.err}`,
        });
      }

      const getKeyShareRes = await getKeyShare(
        state.db,
        {
          user_auth_id: oauthUser.user_identifier,
          auth_type,
          curve_type: req.body.curve_type,
          public_key: publicKeyBytesRes.data,
        },
        state.encryptionSecret,
      );
      if (getKeyShareRes.success === false) {
        return res.status(ErrorCodeMap[getKeyShareRes.code]).json({
          success: false,
          code: getKeyShareRes.code,
          msg: getKeyShareRes.msg,
        });
      }

      return res.status(200).json({
        success: true,
        data: getKeyShareRes.data,
      });
    },
  );

  registry.registerPath({
    method: "post",
    path: "/keyshare/v1/check",
    tags: ["Key Share"],
    summary: "Check if a key share exists",
    description:
      "Check if a key share exists for the provided user_auth_id and public key.",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CheckKeyShareRequestBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully checked key share",
        content: {
          "application/json": {
            schema: CheckKeyShareSuccessResponseSchema,
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
  router.post(
    "/check",
    async (
      req: KSNodeRequest<CheckKeyShareRequestBody>,
      res: Response<KSNodeApiResponse<CheckKeyShareResponse>>,
    ) => {
      const body = req.body;
      // @NOTE: default to google if auth_type is not provided
      const auth_type = (body.auth_type ?? "google") as AuthType;

      const publicKeyLength = body.curve_type === "ed25519" ? 32 : 33;
      const publicKeyBytesRes = Bytes.fromHexString(
        body.public_key,
        publicKeyLength,
      );
      if (publicKeyBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: `Public key is not valid: ${publicKeyBytesRes.err}`,
        });
      }

      const checkKeyShareRes = await checkKeyShare(req.app.locals.db, {
        user_auth_id: body.user_auth_id,
        auth_type,
        curve_type: body.curve_type,
        public_key: publicKeyBytesRes.data,
      });
      if (checkKeyShareRes.success === false) {
        return res.status(ErrorCodeMap[checkKeyShareRes.code]).json({
          success: false,
          code: checkKeyShareRes.code,
          msg: checkKeyShareRes.msg,
        });
      }

      return res.status(200).json({
        success: true,
        data: checkKeyShareRes.data,
      });
    },
  );

  registry.registerPath({
    method: "post",
    path: "/keyshare/v1/reshare",
    tags: ["Key Share"],
    summary: "Create or update a key share",
    description:
      "Creates a new key share if it does not exist, or updates an existing key share with a new encrypted share.",
    security: [{ oauthAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: ReshareKeyShareBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully updated key share",
        content: {
          "application/json": {
            schema: KeyShareEmptySuccessResponseSchema,
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
                summary: "Public key is not valid",
                value: {
                  success: false,
                  code: "PUBLIC_KEY_INVALID",
                  msg: "Public key is not valid",
                },
              },
              SHARE_INVALID: {
                summary: "Share is not valid",
                value: {
                  success: false,
                  code: "SHARE_INVALID",
                  msg: "Share is not valid",
                },
              },
              CURVE_TYPE_NOT_SUPPORTED: {
                summary: "Curve type not supported",
                value: {
                  success: false,
                  code: "CURVE_TYPE_NOT_SUPPORTED",
                  msg: "Curve type not supported",
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
            examples: {
              UNAUTHORIZED: {
                value: {
                  success: false,
                  code: "UNAUTHORIZED",
                  msg: "Unauthorized",
                },
              },
            },
          },
        },
      },
      404: {
        description: "Not found - User, wallet or key share not found",
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
                  msg: "Wallet not found",
                },
              },
              KEY_SHARE_NOT_FOUND: {
                value: {
                  success: false,
                  code: "KEY_SHARE_NOT_FOUND",
                  msg: "Key share not found",
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
  router.post(
    "/reshare",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<ReshareKeyShareBody>,
      res: Response<KSNodeApiResponse<void>, ResponseLocal>,
    ) => {
      const oauthUser = res.locals.oauth_user;
      const auth_type = oauthUser.type;
      const state = req.app.locals;
      const body = req.body;

      const publicKeyLength = body.curve_type === "ed25519" ? 32 : 33;
      const publicKeyBytesRes = Bytes.fromHexString(
        body.public_key,
        publicKeyLength,
      );
      if (publicKeyBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: `Public key is not valid: ${publicKeyBytesRes.err}`,
        });
      }

      const shareBytesRes = Bytes.fromHexString(body.share, 64);
      if (shareBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "SHARE_INVALID",
          msg: `Share is not valid: ${shareBytesRes.err}`,
        });
      }

      const shareBytes: Bytes64 = shareBytesRes.data;

      const reshareKeyShareRes = await reshareKeyShare(
        state.db,
        {
          user_auth_id: oauthUser.user_identifier,
          auth_type,
          curve_type: body.curve_type,
          public_key: publicKeyBytesRes.data,
          share: shareBytes,
        },
        state.encryptionSecret,
      );

      if (reshareKeyShareRes.success === false) {
        return res.status(ErrorCodeMap[reshareKeyShareRes.code]).json({
          success: false,
          code: reshareKeyShareRes.code,
          msg: reshareKeyShareRes.msg,
        });
      }

      return res.status(200).json({
        success: true,
        data: void 0,
      });
    },
  );

  return router;
}

// ============================================================================
// v2 Router
// ============================================================================

export function makeKeyshareV2Router() {
  const router = Router();

  registry.registerPath({
    method: "post",
    path: "/keyshare/v2",
    tags: ["Key Share v2"],
    summary: "Get multiple key shares",
    description:
      "Retrieve multiple key shares for the authenticated user in a single request.",
    security: [{ oauthAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: GetKeyShareV2RequestBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully retrieved key shares",
        content: {
          "application/json": {
            schema: GetKeyShareV2SuccessResponseSchema,
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
        description: "Not found - User, wallet or key share not found",
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
                  msg: "Wallet not found for curve_type: secp256k1",
                },
              },
              KEY_SHARE_NOT_FOUND: {
                value: {
                  success: false,
                  code: "KEY_SHARE_NOT_FOUND",
                  msg: "Key share not found for curve_type: ed25519",
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
  router.post(
    "/",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<GetKeyShareV2RequestBody>,
      res: Response<KSNodeApiResponse<GetKeyShareV2Response>, ResponseLocal>,
    ) => {
      const oauthUser = res.locals.oauth_user;
      const auth_type = oauthUser.type;
      const state = req.app.locals;
      const body = req.body;

      // Validate and convert wallets object
      const validatedWallets: GetKeyShareV2Request["wallets"] = {};

      // Validate secp256k1
      if (body.wallets.secp256k1) {
        const publicKeyBytesRes = Bytes.fromHexString(
          body.wallets.secp256k1,
          33,
        );
        if (publicKeyBytesRes.success === false) {
          return res.status(400).json({
            success: false,
            code: "PUBLIC_KEY_INVALID",
            msg: `Public key is not valid for secp256k1: ${publicKeyBytesRes.err}`,
          });
        }
        validatedWallets.secp256k1 = publicKeyBytesRes.data;
      }

      // Validate ed25519
      if (body.wallets.ed25519) {
        const publicKeyBytesRes = Bytes.fromHexString(body.wallets.ed25519, 32);
        if (publicKeyBytesRes.success === false) {
          return res.status(400).json({
            success: false,
            code: "PUBLIC_KEY_INVALID",
            msg: `Public key is not valid for ed25519: ${publicKeyBytesRes.err}`,
          });
        }
        validatedWallets.ed25519 = publicKeyBytesRes.data;
      }

      const result = await getKeyShareV2(
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
        data: result.data,
      });
    },
  );

  return router;
}
