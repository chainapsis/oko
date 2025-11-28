import type { Request, Response, NextFunction } from "express";
import type { KSNodeApiErrorResponse } from "@oko-wallet/ksn-interface/response";

import type {
  OAuthProvider,
  OAuthValidationFail,
} from "@oko-wallet-ksn-server/auth/types";
import {
  validateAuth0Token,
  validateGoogleOAuthToken,
  validateTelegramHash,
} from "@oko-wallet-ksn-server/auth";
import { ErrorCodeMap } from "@oko-wallet-ksn-server/error";
import type { ResponseLocal } from "@oko-wallet-ksn-server/routes/io";
import { validateAccessTokenOfX } from "@oko-wallet-ksn-server/auth/x";
import type { GoogleTokenInfo } from "@oko-wallet/ksn-interface/auth";
import type { Result } from "@oko-wallet/stdlib-js";
import type { Auth0TokenInfo } from "@oko-wallet-ksn-server/auth/auth0";
import type { XUserInfo } from "@oko-wallet-ksn-server/auth/x";
import type {
  TelegramUserData,
  TelegramUserInfo,
} from "@oko-wallet-ksn-server/auth/telegram";

type OAuthBody = {
  auth_type?: OAuthProvider;
};

type VerifyResult =
  | {
      auth_type: "google";
      data: Result<GoogleTokenInfo, OAuthValidationFail>;
    }
  | {
      auth_type: "auth0";
      data: Result<Auth0TokenInfo, OAuthValidationFail>;
    }
  | {
      auth_type: "x";
      data: Result<XUserInfo, OAuthValidationFail>;
    }
  | {
      auth_type: "telegram";
      data: Result<TelegramUserInfo, OAuthValidationFail>;
    };

export interface AuthenticatedRequest<T = any>
  extends Request<any, any, T & OAuthBody> {}

export async function bearerTokenMiddleware(
  req: AuthenticatedRequest,
  res: Response<any, ResponseLocal>,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const authType = req.body?.auth_type;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const errorRes: KSNodeApiErrorResponse = {
      success: false,
      code: "UNAUTHORIZED",
      msg: "Authorization header with Bearer token required",
    };
    res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
    return;
  }

  const bearerToken = authHeader.substring(7).trim(); // skip "Bearer "

  if (!authType) {
    const errorRes: KSNodeApiErrorResponse = {
      success: false,
      code: "UNAUTHORIZED",
      msg: "auth_type is required in request body",
    };
    res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
    return;
  }

  try {
    let result: VerifyResult;
    switch (authType) {
      case "google":
        result = {
          auth_type: "google",
          data: await validateGoogleOAuthToken(bearerToken),
        };
        break;
      case "auth0":
        result = {
          auth_type: "auth0",
          data: await validateAuth0Token(bearerToken),
        };
        break;
      case "x":
        result = {
          auth_type: "x",
          data: await validateAccessTokenOfX(bearerToken),
        };
        break;
      case "telegram": {
        let userData: TelegramUserData;
        try {
          userData = JSON.parse(bearerToken) as TelegramUserData;
        } catch (error) {
          const errorRes: KSNodeApiErrorResponse = {
            success: false,
            code: "UNAUTHORIZED",
            msg: "Invalid token format: Expected JSON string",
          };
          res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
          return;
        }
        result = {
          auth_type: "telegram",
          data: validateTelegramHash(userData),
        };
        break;
      }
      default:
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "UNAUTHORIZED",
          msg: `Invalid auth_type: ${authType}. Must be 'google', 'auth0', 'x', or 'telegram'`,
        };
        res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
        return;
    }

    if (!result.data.success) {
      const errorRes: KSNodeApiErrorResponse = {
        success: false,
        code: "UNAUTHORIZED",
        msg: result.data.err.message,
      };
      res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      return;
    }

    if (!result.data) {
      const errorRes: KSNodeApiErrorResponse = {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: "Token info missing after validation",
      };
      res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      return;
    }

    if (result.auth_type === "x") {
      if (!result.data.data.id || !result.data.data.username) {
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "UNAUTHORIZED",
          msg: "Invalid token: missing required fields (id or username)",
        };
        res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
        return;
      }
    } else if (result.auth_type === "telegram") {
      if (!result.data.data.id) {
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "UNAUTHORIZED",
          msg: "Invalid token: missing required field (id)",
        };
        res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
        return;
      }
    } else {
      if (
        !result.data.data.email ||
        !result.data.data.sub ||
        !result.data.data.name
      ) {
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "UNAUTHORIZED",
          msg: "Invalid token: missing required fields (email, sub, or name)",
        };
        res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
        return;
      }
    }

    if (result.auth_type === "x") {
      res.locals.oauth_user = {
        type: result.auth_type,
        email: result.data.data.id,
        name: result.data.data.name,
      };
    } else if (result.auth_type === "telegram") {
      res.locals.oauth_user = {
        type: result.auth_type,
        email: result.data.data.id,
        name: result.data.data.username ?? result.data.data.id,
      };
    } else {
      // in google, auth0, we can get email from the token
      res.locals.oauth_user = {
        type: result.auth_type,
        email: result.data.data.email,
        name: result.data.data.name,
        sub: result.data.data.sub,
      };
    }

    next();
    return;
  } catch (error) {
    const errorRes: KSNodeApiErrorResponse = {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
    res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
    return;
  }
}
