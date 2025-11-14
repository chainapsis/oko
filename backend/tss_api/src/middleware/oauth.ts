import type { Request, Response, NextFunction } from "express";

import {
  type GoogleAuthenticatedRequest,
  googleAuthMiddleware,
} from "@oko-wallet-tss-api/middleware/google_auth";
import {
  type Auth0AuthenticatedRequest,
  auth0AuthMiddleware,
} from "@oko-wallet-tss-api/middleware/auth0_auth";

export interface OAuthAuthenticatedRequest<T = {}> extends Request {
  body: { authType: "google" | "auth0" } & T;
}

export async function oauthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authType = req.body?.authType;

  if (!authType) {
    res.status(400).json({
      error: "authType is required in request body",
    });
    return;
  }

  if (authType === "google") {
    return googleAuthMiddleware(req as GoogleAuthenticatedRequest, res, next);
  } else if (authType === "auth0") {
    return auth0AuthMiddleware(req as Auth0AuthenticatedRequest, res, next);
  } else {
    res.status(400).json({
      error: `Invalid authType: ${authType}. Must be 'google' or 'auth0'`,
    });
    return;
  }
}
