import type { Request, Response, NextFunction } from "express";
import type { KSNodeApiErrorResponse } from "@oko-wallet/ksn-interface/response";

import type {
  OAuthProvider,
  OAuthValidationFail,
} from "@oko-wallet-ksn-server/auth/types";
import {
  validateAuth0Token,
  validateGoogleOAuthToken,
} from "@oko-wallet-ksn-server/auth";
import { ErrorCodeMap } from "@oko-wallet-ksn-server/error";
import type { ResponseLocal } from "@oko-wallet-ksn-server/routes/io";
import { validateAccessTokenOfX } from "@oko-wallet-ksn-server/auth/x";
import type { GoogleTokenInfo } from "@oko-wallet/ksn-interface/auth";
import type { Result } from "@oko-wallet/stdlib-js";
import type { Auth0TokenInfo } from "@oko-wallet-ksn-server/auth/auth0";
import type { XUserInfo } from "@oko-wallet-ksn-server/auth/x";

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

  const idToken = authHeader.substring(7); // skip "Bearer "

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
          data: await validateGoogleOAuthToken(idToken),
        };
        break;
      case "auth0":
        result = {
          auth_type: "auth0",
          data: await validateAuth0Token(idToken),
        };
        break;
      case "x":
        result = {
          auth_type: "x",
          data: await validateAccessTokenOfX(idToken),
        };
        break;
      default:
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "UNAUTHORIZED",
          msg: `Invalid auth_type: ${authType}. Must be 'google' or 'auth0'`,
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

    res.locals.oauth_user =
      result.auth_type === "x"
        ? {
            type: result.auth_type,
            // we cannot get email from x,
            // so the ID is temporarily being used as the email address.
            email: result.data.data.id,
            name: result.data.data.name,
          }
        : {
            type: result.auth_type,
            email: result.data.data.email,
            name: result.data.data.name,
            sub: result.data.data.sub,
          };

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
