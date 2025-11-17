import type { Request, Response, NextFunction } from "express";
import type { KSNodeApiErrorResponse } from "@oko-wallet/ksn-interface/response";
import type { OAuthProvider } from "@oko-wallet-ksn-server/auth/types";

import {
  validateAuth0Token,
  validateGoogleOAuthToken,
} from "@oko-wallet-ksn-server/auth";
import { ErrorCodeMap } from "@oko-wallet-ksn-server/error";
import type { ResponseLocal } from "@oko-wallet-ksn-server/routes/io";

type OAuthBody = {
  auth_type?: OAuthProvider;
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
    let result;
    switch (authType) {
      case "google":
        result = await validateGoogleOAuthToken(idToken);
        break;
      case "auth0":
        result = await validateAuth0Token(idToken);
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

    if (!result.success) {
      const errorRes: KSNodeApiErrorResponse = {
        success: false,
        code: "UNAUTHORIZED",
        msg: result.err.message,
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

    if (!result.data.email || !result.data.sub || !result.data.name) {
      const errorRes: KSNodeApiErrorResponse = {
        success: false,
        code: "UNAUTHORIZED",
        msg: "Invalid token: missing required fields (email, sub, or name)",
      };
      res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      return;
    }

    res.locals.oauth_user = {
      type: authType,
      email: result.data.email,
      name: result.data.name,
      sub: result.data.sub,
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
