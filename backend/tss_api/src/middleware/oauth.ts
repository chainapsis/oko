import type { Request, Response, NextFunction } from "express";

import {
  type GoogleAuthenticatedRequest,
  googleAuthMiddleware,
} from "@oko-wallet-tss-api/middleware/google_auth";
import {
  type Auth0AuthenticatedRequest,
  auth0AuthMiddleware,
} from "@oko-wallet-tss-api/middleware/auth0_auth";
import {
  type XAuthenticatedRequest,
  xAuthMiddleware,
} from "@oko-wallet-tss-api/middleware/x_auth";

export type OAuthProvider = "google" | "auth0" | "x";

export interface OAuthBody {
  auth_type: OAuthProvider;
}

export type OAuthAuthenticatedRequest<T = {}> = Request<
  any,
  any,
  OAuthBody & T
>;

export async function oauthMiddleware(
  req: OAuthAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authType = req.body?.auth_type as OAuthProvider | undefined;

  if (!authType) {
    res.status(400).json({
      error: "auth_type is required in request body",
    });
    return;
  }

  switch (authType) {
    case "google":
      return googleAuthMiddleware(req as GoogleAuthenticatedRequest, res, next);
    case "auth0":
      return auth0AuthMiddleware(req as Auth0AuthenticatedRequest, res, next);
    case "x":
      return xAuthMiddleware(req as XAuthenticatedRequest, res, next);
    default:
      res.status(400).json({
        error: `Invalid auth_type: ${authType}. Must be 'google', 'auth0', or 'x'`,
      });
      return;
  }
}
