import { Router, type Response } from "express";
import type {
  CheckKeyShareV2Request,
  CheckKeyShareV2RequestBody,
  CheckKeyShareV2Response,
  GetKeyShareV2Request,
  GetKeyShareV2RequestBody,
  GetKeyShareV2Response,
  RegisterKeyShareV2Request,
  RegisterKeyShareV2RequestBody,
  RegisterEd25519V2Request,
  RegisterEd25519V2RequestBody,
  ReshareKeyShareV2Request,
  ReshareKeyShareV2RequestBody,
} from "@oko-wallet/ksn-interface/key_share";
import { Bytes } from "@oko-wallet/bytes";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import {
  checkKeyShareV2,
  getKeyShareV2,
  registerKeyShareV2,
  registerEd25519V2,
  reshareKeyShareV2,
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
  CheckKeyShareV2RequestBodySchema,
  CheckKeyShareV2SuccessResponseSchema,
  GetKeyShareV2RequestBodySchema,
  GetKeyShareV2SuccessResponseSchema,
  RegisterKeyShareV2RequestBodySchema,
  RegisterKeyShareV2SuccessResponseSchema,
  RegisterEd25519V2RequestBodySchema,
  RegisterEd25519V2SuccessResponseSchema,
  ReshareKeyShareV2RequestBodySchema,
  ReshareKeyShareV2SuccessResponseSchema,
  ErrorResponseSchema,
} from "@oko-wallet-ksn-server/openapi/schema";

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

  // --- POST /check ---
  registry.registerPath({
    method: "post",
    path: "/keyshare/v2/check",
    tags: ["Key Share v2"],
    summary: "Check multiple key shares existence",
    description:
      "Check existence of multiple key shares for a user in a single request. No authentication required.",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: CheckKeyShareV2RequestBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully checked key shares existence",
        content: {
          "application/json": {
            schema: CheckKeyShareV2SuccessResponseSchema,
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
      req: KSNodeRequest<CheckKeyShareV2RequestBody>,
      res: Response<KSNodeApiResponse<CheckKeyShareV2Response>, ResponseLocal>,
    ) => {
      const state = req.app.locals;
      const body = req.body;

      // Validate and convert wallets object
      const validatedWallets: CheckKeyShareV2Request["wallets"] = {};

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

      const result = await checkKeyShareV2(state.db, {
        user_auth_id: body.user_auth_id,
        auth_type: body.auth_type,
        wallets: validatedWallets,
      });

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
  router.post(
    "/register",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<RegisterKeyShareV2RequestBody>,
      res: Response<KSNodeApiResponse<void>, ResponseLocal>,
    ) => {
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
        const shareBytesRes = Bytes.fromHexString(
          body.wallets.secp256k1.share,
          64,
        );
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
        const shareBytesRes = Bytes.fromHexString(
          body.wallets.ed25519.share,
          64,
        );
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
    },
  );

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
  router.post(
    "/register/ed25519",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<RegisterEd25519V2RequestBody>,
      res: Response<KSNodeApiResponse<void>, ResponseLocal>,
    ) => {
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
    },
  );

  // --- POST /reshare ---
  registry.registerPath({
    method: "post",
    path: "/keyshare/v2/reshare",
    tags: ["Key Share v2"],
    summary: "Reshare multiple key shares",
    description:
      "Validate and update reshared_at timestamp for multiple key shares. Validates that provided shares match existing shares.",
    security: [{ oauthAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: ReshareKeyShareV2RequestBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully reshared key shares",
        content: {
          "application/json": {
            schema: ReshareKeyShareV2SuccessResponseSchema,
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
              RESHARE_FAILED: {
                value: {
                  success: false,
                  code: "RESHARE_FAILED",
                  msg: "Share mismatch for curve_type: secp256k1",
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
    "/reshare",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<ReshareKeyShareV2RequestBody>,
      res: Response<KSNodeApiResponse<void>, ResponseLocal>,
    ) => {
      const oauthUser = res.locals.oauth_user;
      const auth_type = oauthUser.type;
      const state = req.app.locals;
      const body = req.body;

      // Validate and convert wallets object
      const validatedWallets: ReshareKeyShareV2Request["wallets"] = {};

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
        const shareBytesRes = Bytes.fromHexString(
          body.wallets.secp256k1.share,
          64,
        );
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
        const shareBytesRes = Bytes.fromHexString(
          body.wallets.ed25519.share,
          64,
        );
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

      const result = await reshareKeyShareV2(
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
    },
  );

  return router;
}
